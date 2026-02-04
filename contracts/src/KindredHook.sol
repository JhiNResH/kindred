// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReputationOracle {
    function getScore(address account) external view returns (uint256);
    function isBlocked(address account) external view returns (bool);
}

contract KindredHook {
    IReputationOracle public immutable reputationOracle;
    
    uint256 public constant MIN_SCORE_TO_TRADE = 100;
    uint256 public constant ELITE_THRESHOLD = 900;
    uint256 public constant TRUSTED_THRESHOLD = 700;
    uint256 public constant NORMAL_THRESHOLD = 400;
    
    uint24 public constant FEE_ELITE = 10;
    uint24 public constant FEE_TRUSTED = 20;
    uint24 public constant FEE_NORMAL = 30;
    uint24 public constant FEE_RISKY = 50;
    
    error ReputationTooLow(address account, uint256 score);
    error AccountBlocked(address account);
    error ZeroAddress();
    
    event SwapWithReputation(address indexed trader, uint256 reputationScore, uint24 feeApplied);

    constructor(address _reputationOracle) {
        if (_reputationOracle == address(0)) revert ZeroAddress();
        reputationOracle = IReputationOracle(_reputationOracle);
    }

    function calculateFee(uint256 score) public pure returns (uint24) {
        if (score >= ELITE_THRESHOLD) return FEE_ELITE;
        else if (score >= TRUSTED_THRESHOLD) return FEE_TRUSTED;
        else if (score >= NORMAL_THRESHOLD) return FEE_NORMAL;
        else return FEE_RISKY;
    }
    
    function getFeeForAccount(address account) external view returns (uint24) {
        return calculateFee(reputationOracle.getScore(account));
    }
    
    function canTrade(address account) external view returns (bool) {
        if (reputationOracle.isBlocked(account)) return false;
        return reputationOracle.getScore(account) >= MIN_SCORE_TO_TRADE;
    }
    
    function validateTrade(address trader) external view returns (uint24 fee) {
        if (reputationOracle.isBlocked(trader)) revert AccountBlocked(trader);
        uint256 score = reputationOracle.getScore(trader);
        if (score < MIN_SCORE_TO_TRADE) revert ReputationTooLow(trader, score);
        return calculateFee(score);
    }
}
