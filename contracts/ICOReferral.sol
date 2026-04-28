// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ICOReferral
 * @dev 5-Level MLM Referral System for Orakzai Bond (OKBOND)
 * Commission Structure: L1: 5%, L2: 3%, L3: 2%, L4: 1%, L5: 0.5%
 * Includes Chairman-level controls: Pausable, Updatable Rates, and Emergency Withdraw.
 */

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

abstract contract Ownable {
    address private _owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    constructor() { _owner = msg.sender; }
    function owner() public view virtual returns (address) { return _owner; }
    modifier onlyOwner() { require(owner() == msg.sender, "Ownable: caller is not the owner"); _; }
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;
    constructor() { _status = _NOT_ENTERED; }
    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract ICOReferral is Ownable, ReentrancyGuard {
    IERC20 public token;
    address public rewardPoolWallet;
    bool public paused;
    
    // Basis points: 500 = 5%, 300 = 3%, 200 = 2%, 100 = 1%, 50 = 0.5%
    uint256[5] public levelRates = [500, 300, 200, 100, 50];
    
    mapping(address => address) public referrers;
    mapping(address => uint256[5]) public levelCounts;
    mapping(address => uint256[5]) public levelEarnings;
    mapping(address => uint256) public totalReferralEarnings;

    event ReferralRecorded(address indexed user, address indexed referrer);
    event ReferralRewardPaid(address indexed referrer, address indexed buyer, uint256 amount, uint256 level);
    event RatesUpdated(uint256[5] newRates);
    event RewardPoolUpdated(address indexed oldPool, address indexed newPool);
    event Paused(address account);
    event Unpaused(address account);

    modifier whenNotPaused() {
        require(!paused, "Pausable: paused");
        _;
    }

    constructor(address _token, address _rewardPoolWallet) {
        token = IERC20(_token);
        rewardPoolWallet = _rewardPoolWallet;
    }

    // --- Admin Functions ---

    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    function setRewardPoolWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid address");
        emit RewardPoolUpdated(rewardPoolWallet, _newWallet);
        rewardPoolWallet = _newWallet;
    }

    function updateLevels(uint256[] memory newRates) external onlyOwner {
        require(newRates.length == 5, "Must provide 5 rates");
        for (uint256 i = 0; i < 5; i++) {
            levelRates[i] = newRates[i];
        }
        emit RatesUpdated(levelRates);
    }

    /**
     * @dev Emergency withdraw tokens stuck in the contract back to owner.
     * Note: This does not withdraw from the Reward Pool wallet, only tokens sent to THIS contract.
     */
    function emergencyWithdraw(address _tokenAddress, uint256 _amount) external onlyOwner {
        IERC20(_tokenAddress).transfer(owner(), _amount);
    }

    // --- Internal Logic ---

    function recordReferral(address _user, address _referrer) internal {
        if (referrers[_user] == address(0) && _referrer != address(0) && _referrer != _user) {
            referrers[_user] = _referrer;
            
            address currentReferrer = _referrer;
            for (uint256 i = 0; i < 5; i++) {
                if (currentReferrer == address(0)) break;
                levelCounts[currentReferrer][i]++;
                currentReferrer = referrers[currentReferrer];
            }
            
            emit ReferralRecorded(_user, _referrer);
        }
    }

    // --- External Logic ---

    /**
     * @dev Distributes rewards across 5 levels.
     * Must be called by the ICO contract or authorized backend.
     */
    function distributeRewards(address _buyer, uint256 _tokenAmount, address _referrer) external nonReentrant whenNotPaused {
        recordReferral(_buyer, _referrer);
        
        address currentReferrer = referrers[_buyer];
        for (uint256 i = 0; i < 5; i++) {
            if (currentReferrer == address(0)) break;
            
            uint256 reward = (_tokenAmount * levelRates[i]) / 10000;
            if (reward > 0) {
                // Ensure pool has enough tokens and is approved
                require(token.transferFrom(rewardPoolWallet, currentReferrer, reward), "Reward transfer failed");
                
                levelEarnings[currentReferrer][i] += reward;
                totalReferralEarnings[currentReferrer] += reward;
                
                emit ReferralRewardPaid(currentReferrer, _buyer, reward, i + 1);
            }
            
            currentReferrer = referrers[currentReferrer];
        }
    }

    function getUserStats(address _user) external view returns (
        uint256[5] memory counts,
        uint256[5] memory earnings,
        uint256 totalEarnings,
        address referrer
    ) {
        return (levelCounts[_user], levelEarnings[_user], totalReferralEarnings[_user], referrers[_user]);
    }
}
