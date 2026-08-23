// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract OrakzaiBondLottery {

    IERC20 public token;
    address public owner;

    uint256 public entryAmount = 100 * 1e18;
    uint256 public lockDuration = 60 days;

    uint256 public startTime;
    bool public lotteryStarted;
    bool public winnersSelected;

    uint256 public rewardPerWinner;

    address[] public players;
    address[] public winners;

    mapping(address => uint256) public deposits;
    mapping(address => bool) public hasEntered;
    mapping(address => bool) public isWinner;
    mapping(address => bool) public rewardClaimed;

    constructor(address _token) {
        token = IERC20(_token);
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function startLottery() external onlyOwner {
        require(!lotteryStarted, "Already started");
        lotteryStarted = true;
        startTime = block.timestamp;
    }

    function enterLottery() external {
        require(lotteryStarted, "Not started");
        require(!hasEntered[msg.sender], "Already entered");

        require(
            token.transferFrom(msg.sender, address(this), entryAmount),
            "Transfer failed"
        );

        deposits[msg.sender] = entryAmount;
        players.push(msg.sender);
        hasEntered[msg.sender] = true;
    }

    function random(uint256 i) internal view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    i,
                    players.length
                )
            )
        );
    }

    function selectWinners() external onlyOwner {
        require(lotteryStarted, "Not started");
        require(block.timestamp >= startTime + lockDuration, "Still locked");
        require(!winnersSelected, "Already selected");
        require(players.length >= 5, "Min 5 players");

        uint256 totalRewardPool = address(this).balance;
        require(totalRewardPool > 0, "No MATIC");

        rewardPerWinner = totalRewardPool / 5;

        uint256 count = 0;
        uint256 attempts = 0;

        while (count < 5 && attempts < 30) {
            uint256 randIndex = random(count + attempts) % players.length;
            address selected = players[randIndex];

            if (!isWinner[selected]) {
                isWinner[selected] = true;
                winners.push(selected);
                count++;
            }
            attempts++;
        }

        require(count == 5, "Winner selection failed");

        winnersSelected = true;
    }

    function claimRefund() external {
        require(winnersSelected, "Not finished");
        require(!isWinner[msg.sender], "Winner cannot refund");

        uint256 amount = deposits[msg.sender];
        require(amount > 0, "No deposit");

        deposits[msg.sender] = 0;

        require(token.transfer(msg.sender, amount), "Refund failed");
    }

    function claimReward() external {
        require(winnersSelected, "Not finished");
        require(isWinner[msg.sender], "Not winner");
        require(!rewardClaimed[msg.sender], "Already claimed");

        rewardClaimed[msg.sender] = true;

        (bool success, ) = payable(msg.sender).call{
            value: rewardPerWinner
        }("");
        require(success, "Transfer failed");
    }

    receive() external payable {}
}