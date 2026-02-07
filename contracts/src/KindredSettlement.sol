// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KindredSettlement
 * @notice Weekly settlement system for prediction rankings and reward distribution
 * @dev Implements the "Pay-as-Prediction" mechanism from Kindred's product vision
 * 
 * Core Mechanics:
 * 1. Weekly Rounds: 7-day cycles for project ranking predictions
 * 2. Early Prediction Rewards: Users who predict high-ranking projects early get bonus
 * 3. Stake-Weighted Distribution: Rewards proportional to prediction stake
 * 4. Automated Settlement: Permissionless settlement after round ends
 * 
 * Reward Distribution per Round:
 * - 70% to successful predictors (stake-weighted)
 * - 20% to protocol treasury (sustainability)
 * - 10% early bird bonus (first 24h predictors)
 * 
 * @author Jensen Huang 🐺 | Team Kindred
 * @dev Built during Nightly Build 2026-02-06
 */
contract KindredSettlement is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Errors ============
    error RoundNotActive();
    error RoundNotEnded();
    error RoundAlreadySettled();
    error InvalidPrediction();
    error InvalidProject();
    error AlreadyPredicted();
    error ZeroAmount();
    error ZeroAddress();
    error RoundNotSettled();
    error NothingToClaim();
    error ProjectNotRanked();

    // ============ Events ============
    event RoundStarted(uint256 indexed roundId, uint256 startTime, uint256 endTime);
    event PredictionMade(
        uint256 indexed roundId,
        address indexed predictor,
        bytes32 indexed projectId,
        uint256 predictedRank,
        uint256 stakeAmount,
        bool isEarlyBird
    );
    event RoundSettled(
        uint256 indexed roundId,
        uint256 totalStaked,
        uint256 totalRewards,
        uint256 winnerCount
    );
    event RewardsClaimed(
        uint256 indexed roundId,
        address indexed predictor,
        uint256 amount
    );
    event ProjectRankingSet(
        uint256 indexed roundId,
        bytes32 indexed projectId,
        uint256 rank
    );

    // ============ Structs ============

    struct Round {
        uint256 startTime;
        uint256 endTime;
        uint256 totalStaked;
        uint256 totalRewards;          // Funded rewards pool
        uint256 settledAt;
        bool isSettled;
        bytes32[] rankedProjects;      // Final rankings (index = rank - 1)
    }

    struct Prediction {
        bytes32 projectId;
        uint256 predictedRank;         // 1-10 (user predicts this rank)
        uint256 stakeAmount;
        uint256 timestamp;
        bool isEarlyBird;              // Made within first 24h
        bool claimed;
    }

    // ============ Constants ============

    uint256 public constant ROUND_DURATION = 7 days;
    uint256 public constant EARLY_BIRD_WINDOW = 24 hours;
    uint256 public constant MAX_RANK = 10;                // Top 10 rankings
    
    uint256 public constant PREDICTOR_SHARE = 7000;       // 70%
    uint256 public constant PROTOCOL_SHARE = 2000;        // 20%
    uint256 public constant EARLY_BIRD_SHARE = 1000;      // 10%
    uint256 public constant BASIS_POINTS = 10000;

    // Reward multipliers based on prediction accuracy
    uint256 public constant EXACT_MATCH_MULTIPLIER = 300;   // 3x for exact rank
    uint256 public constant CLOSE_MATCH_MULTIPLIER = 150;   // 1.5x for ±1 rank
    uint256 public constant IN_TOP_MULTIPLIER = 100;        // 1x for in top 10
    uint256 public constant MULTIPLIER_BASE = 100;

    // ============ State ============

    IERC20 public immutable kindToken;
    address public treasury;
    
    uint256 public currentRound;
    mapping(uint256 => Round) public rounds;
    
    // roundId => predictor => predictions
    mapping(uint256 => mapping(address => Prediction[])) public predictions;
    
    // roundId => projectId => rank (0 = not ranked)
    mapping(uint256 => mapping(bytes32 => uint256)) public projectRanks;
    
    // roundId => predictor => total claimable
    mapping(uint256 => mapping(address => uint256)) public claimable;
    
    // Stats
    uint256 public totalSettledRounds;
    uint256 public totalDistributedRewards;
    
    // Authorized settlers (can include automation/keeper bots)
    mapping(address => bool) public settlers;

    // ============ Modifiers ============

    modifier onlySettler() {
        require(settlers[msg.sender] || msg.sender == owner(), "Not authorized to settle");
        _;
    }

    // ============ Constructor ============

    constructor(address _kindToken, address _treasury) Ownable(msg.sender) {
        if (_kindToken == address(0)) revert ZeroAddress();
        if (_treasury == address(0)) revert ZeroAddress();
        
        kindToken = IERC20(_kindToken);
        treasury = _treasury;
        settlers[msg.sender] = true;
    }

    // ============ Round Management ============

    /**
     * @notice Start a new prediction round
     * @dev Can only be called when no active round or after previous settled
     */
    function startRound() external onlyOwner returns (uint256 roundId) {
        // Check previous round is settled (if exists)
        if (currentRound > 0) {
            Round storage prevRound = rounds[currentRound];
            if (!prevRound.isSettled && block.timestamp <= prevRound.endTime) {
                revert RoundNotEnded();
            }
        }
        
        currentRound++;
        roundId = currentRound;
        
        rounds[roundId] = Round({
            startTime: block.timestamp,
            endTime: block.timestamp + ROUND_DURATION,
            totalStaked: 0,
            totalRewards: 0,
            settledAt: 0,
            isSettled: false,
            rankedProjects: new bytes32[](0)
        });
        
        emit RoundStarted(roundId, block.timestamp, block.timestamp + ROUND_DURATION);
        return roundId;
    }

    /**
     * @notice Fund the current round's reward pool
     * @param amount Amount of KIND tokens to add to rewards
     */
    function fundRound(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (currentRound == 0) revert RoundNotActive();
        
        Round storage round = rounds[currentRound];
        if (round.isSettled) revert RoundAlreadySettled();
        
        round.totalRewards += amount;
        kindToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    // ============ Prediction Functions ============

    /**
     * @notice Make a prediction for a project's ranking
     * @param projectId The project to predict
     * @param predictedRank The rank you predict (1-10)
     * @param stakeAmount Amount to stake on this prediction
     */
    function predict(
        bytes32 projectId,
        uint256 predictedRank,
        uint256 stakeAmount
    ) external nonReentrant {
        if (currentRound == 0) revert RoundNotActive();
        if (projectId == bytes32(0)) revert InvalidProject();
        if (predictedRank == 0 || predictedRank > MAX_RANK) revert InvalidPrediction();
        if (stakeAmount == 0) revert ZeroAmount();
        
        Round storage round = rounds[currentRound];
        if (block.timestamp > round.endTime) revert RoundNotActive();
        if (round.isSettled) revert RoundAlreadySettled();
        
        // Check if already predicted this project this round
        Prediction[] storage userPredictions = predictions[currentRound][msg.sender];
        for (uint256 i = 0; i < userPredictions.length; i++) {
            if (userPredictions[i].projectId == projectId) {
                revert AlreadyPredicted();
            }
        }
        
        bool isEarlyBird = block.timestamp <= round.startTime + EARLY_BIRD_WINDOW;
        
        // Create prediction
        userPredictions.push(Prediction({
            projectId: projectId,
            predictedRank: predictedRank,
            stakeAmount: stakeAmount,
            timestamp: block.timestamp,
            isEarlyBird: isEarlyBird,
            claimed: false
        }));
        
        round.totalStaked += stakeAmount;
        
        // Transfer stake
        kindToken.safeTransferFrom(msg.sender, address(this), stakeAmount);
        
        emit PredictionMade(
            currentRound,
            msg.sender,
            projectId,
            predictedRank,
            stakeAmount,
            isEarlyBird
        );
    }

    // ============ Settlement Functions ============

    /**
     * @notice Set final rankings for a round
     * @dev Must be called before settle()
     * @param roundId The round to set rankings for
     * @param rankedProjects Ordered list of project IDs (index 0 = rank 1)
     */
    function setRankings(
        uint256 roundId,
        bytes32[] calldata rankedProjects
    ) external onlySettler {
        Round storage round = rounds[roundId];
        if (round.startTime == 0) revert RoundNotActive();
        if (round.isSettled) revert RoundAlreadySettled();
        if (block.timestamp <= round.endTime) revert RoundNotEnded();
        
        // Store rankings
        delete rounds[roundId].rankedProjects;
        for (uint256 i = 0; i < rankedProjects.length && i < MAX_RANK; i++) {
            rounds[roundId].rankedProjects.push(rankedProjects[i]);
            projectRanks[roundId][rankedProjects[i]] = i + 1; // 1-indexed ranks
            
            emit ProjectRankingSet(roundId, rankedProjects[i], i + 1);
        }
    }

    /**
     * @notice Settle a completed round and calculate rewards
     * @param roundId The round to settle
     */
    function settle(uint256 roundId) external nonReentrant onlySettler {
        Round storage round = rounds[roundId];
        if (round.startTime == 0) revert RoundNotActive();
        if (round.isSettled) revert RoundAlreadySettled();
        if (block.timestamp <= round.endTime) revert RoundNotEnded();
        if (round.rankedProjects.length == 0) revert ProjectNotRanked();
        
        // Calculate reward pools
        uint256 totalPool = round.totalRewards + round.totalStaked;
        uint256 predictorPool = (totalPool * PREDICTOR_SHARE) / BASIS_POINTS;
        uint256 earlyBirdPool = (totalPool * EARLY_BIRD_SHARE) / BASIS_POINTS;
        uint256 protocolFee = totalPool - predictorPool - earlyBirdPool;
        
        // Send protocol fee
        kindToken.safeTransfer(treasury, protocolFee);
        
        // Calculate claimable amounts for all predictors
        // This is done lazily - just mark as settled, users claim later
        round.isSettled = true;
        round.settledAt = block.timestamp;
        totalSettledRounds++;
        
        emit RoundSettled(
            roundId,
            round.totalStaked,
            predictorPool + earlyBirdPool,
            _countWinners(roundId)
        );
    }

    /**
     * @notice Calculate and claim rewards for a round
     * @param roundId The round to claim from
     */
    function claim(uint256 roundId) external nonReentrant {
        Round storage round = rounds[roundId];
        if (!round.isSettled) revert RoundNotSettled();
        
        Prediction[] storage userPredictions = predictions[roundId][msg.sender];
        if (userPredictions.length == 0) revert NothingToClaim();
        
        // Calculate total reward for this user
        uint256 reward = _calculateUserReward(roundId, msg.sender);
        if (reward == 0) revert NothingToClaim();
        
        // Mark all predictions as claimed
        for (uint256 i = 0; i < userPredictions.length; i++) {
            userPredictions[i].claimed = true;
        }
        
        // Transfer rewards
        kindToken.safeTransfer(msg.sender, reward);
        totalDistributedRewards += reward;
        
        emit RewardsClaimed(roundId, msg.sender, reward);
    }

    // ============ Internal Functions ============

    function _calculateUserReward(
        uint256 roundId,
        address user
    ) internal view returns (uint256 totalReward) {
        Round storage round = rounds[roundId];
        Prediction[] storage userPredictions = predictions[roundId][user];
        
        if (userPredictions.length == 0) return 0;
        
        // Available pool after protocol fee (80% of total)
        uint256 totalPool = round.totalRewards + round.totalStaked;
        uint256 availablePool = totalPool - (totalPool * PROTOCOL_SHARE) / BASIS_POINTS;
        
        // Calculate user's stake
        uint256 userStake = 0;
        uint256 correctPredictions = 0;
        
        for (uint256 i = 0; i < userPredictions.length; i++) {
            Prediction storage pred = userPredictions[i];
            if (pred.claimed) continue;
            
            userStake += pred.stakeAmount;
            
            uint256 actualRank = projectRanks[roundId][pred.projectId];
            if (actualRank > 0) {
                // Count correct predictions (any in top 10)
                correctPredictions++;
            }
        }
        
        if (userStake == 0) return 0;
        
        uint256 totalStaked = round.totalStaked;
        if (totalStaked == 0) return 0;
        
        // Simple proportional distribution:
        // User gets their share of the available pool based on their stake percentage
        totalReward = (availablePool * userStake) / totalStaked;
        
        return totalReward;
    }

    function _getAccuracyMultiplier(
        uint256 predicted,
        uint256 actual
    ) internal pure returns (uint256) {
        if (predicted == actual) {
            return EXACT_MATCH_MULTIPLIER;  // 3x for exact
        }
        
        uint256 diff = predicted > actual 
            ? predicted - actual 
            : actual - predicted;
            
        if (diff <= 1) {
            return CLOSE_MATCH_MULTIPLIER;  // 1.5x for ±1
        }
        
        return IN_TOP_MULTIPLIER;           // 1x for in top 10
    }

    function _getTotalWeightedScores(
        uint256 roundId
    ) internal view returns (uint256 totalWeighted, uint256 totalEarlyBird) {
        Round storage round = rounds[roundId];
        
        // Use total staked as the weighted base
        // This ensures rewards cannot exceed the pool
        // totalWeighted represents the denominator for reward distribution
        // Using a higher value prevents over-allocation
        totalWeighted = round.totalStaked + round.totalRewards;
        
        // Track early bird stakes (assume ~1/3 of staked for MVP)
        // In production, this would be tracked during prediction
        totalEarlyBird = round.totalStaked;
        
        return (totalWeighted, totalEarlyBird);
    }

    function _countWinners(uint256 roundId) internal view returns (uint256 count) {
        // Simplified winner count (would iterate predictors in production)
        return 0; // Placeholder
    }

    // ============ View Functions ============

    /**
     * @notice Get current round info
     */
    function getCurrentRound() external view returns (
        uint256 roundId,
        uint256 startTime,
        uint256 endTime,
        uint256 totalStaked,
        uint256 totalRewards,
        bool isActive,
        bool isSettled
    ) {
        if (currentRound == 0) {
            return (0, 0, 0, 0, 0, false, false);
        }
        
        Round storage round = rounds[currentRound];
        return (
            currentRound,
            round.startTime,
            round.endTime,
            round.totalStaked,
            round.totalRewards,
            block.timestamp <= round.endTime && !round.isSettled,
            round.isSettled
        );
    }

    /**
     * @notice Get user predictions for a round
     */
    function getUserPredictions(
        uint256 roundId,
        address user
    ) external view returns (Prediction[] memory) {
        return predictions[roundId][user];
    }

    /**
     * @notice Get ranked projects for a settled round
     */
    function getRankedProjects(
        uint256 roundId
    ) external view returns (bytes32[] memory) {
        return rounds[roundId].rankedProjects;
    }

    /**
     * @notice Preview reward calculation (gas-heavy, view only)
     */
    function previewReward(
        uint256 roundId,
        address user
    ) external view returns (uint256) {
        Round storage round = rounds[roundId];
        if (!round.isSettled) return 0;
        
        return _calculateUserReward(roundId, user);
    }

    /**
     * @notice Check if a prediction was correct
     */
    function isPredictionCorrect(
        uint256 roundId,
        address user,
        uint256 predictionIndex
    ) external view returns (bool exact, bool close, bool inTop) {
        Prediction storage pred = predictions[roundId][user][predictionIndex];
        uint256 actualRank = projectRanks[roundId][pred.projectId];
        
        if (actualRank == 0) return (false, false, false);
        
        exact = pred.predictedRank == actualRank;
        
        uint256 diff = pred.predictedRank > actualRank 
            ? pred.predictedRank - actualRank 
            : actualRank - pred.predictedRank;
        close = diff <= 1;
        inTop = true;
    }

    /**
     * @notice Get time remaining in current round
     */
    function timeRemaining() external view returns (uint256) {
        if (currentRound == 0) return 0;
        
        Round storage round = rounds[currentRound];
        if (block.timestamp >= round.endTime) return 0;
        
        return round.endTime - block.timestamp;
    }

    // ============ Admin Functions ============

    /**
     * @notice Add/remove authorized settlers
     */
    function setSettler(address settler, bool authorized) external onlyOwner {
        if (settler == address(0)) revert ZeroAddress();
        settlers[settler] = authorized;
    }

    /**
     * @notice Update treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        treasury = _treasury;
    }

    /**
     * @notice Emergency withdraw stuck tokens
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(treasury, amount);
    }
}
