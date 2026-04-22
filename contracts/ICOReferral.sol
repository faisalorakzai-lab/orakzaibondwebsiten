// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ICOReferral is Ownable, ReentrancyGuard {
    IERC20 public token;
    address public rewardPoolWallet;
    
    uint256[] public levelRates = [500, 300, 200, 100, 50]; // Basis points: 5%, 3%, 2%, 1%, 0.5%
    
    mapping(address => address) public referrers;
    mapping(address => uint256[5]) public levelCounts;
    mapping(address => uint256[5]) public levelEarnings;
    mapping(address => uint256) public totalReferralEarnings;

    event ReferralRecorded(address indexed user, address indexed referrer);
    event ReferralRewardPaid(address indexed referrer, address indexed buyer, uint256 amount, uint256 level);

    constructor(address _token, address _rewardPoolWallet) {
        token = IERC20(_token);
        rewardPoolWallet = _rewardPoolWallet;
    }

    function setRewardPoolWallet(address _newWallet) external onlyOwner {
        rewardPoolWallet = _newWallet;
    }

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

    function distributeRewards(address _buyer, uint256 _tokenAmount, address _referrer) external nonReentrant {
        recordReferral(_buyer, _referrer);
        
        address currentReferrer = referrers[_buyer];
        for (uint256 i = 0; i < 5; i++) {
            if (currentReferrer == address(0)) break;
            
            uint256 reward = (_tokenAmount * levelRates[i]) / 10000;
            if (reward > 0) {
                // Transfer from reward pool to referrer
                require(token.transferFrom(rewardPoolWallet, currentReferrer, reward), "Transfer failed");
                
                levelEarnings[currentReferrer][i] += reward;
                totalReferralEarnings[currentReferrer] += reward;
                
                emit ReferralRewardPaid(currentReferrer, _buyer, reward, i + 1);
            }
            
            currentReferrer = referrers[currentReferrer];
        }
    }

    // View functions for frontend
    function getUserStats(address _user) external view returns (
        uint256[5] memory counts,
        uint256[5] memory earnings,
        uint256 totalEarnings,
        address referrer
    ) {
        return (levelCounts[_user], levelEarnings[_user], totalReferralEarnings[_user], referrers[_user]);
    }
}
