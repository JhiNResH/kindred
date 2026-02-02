// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IReputationOracle
/// @notice Interface for querying reputation scores in the Kindred protocol
/// @dev Used by KindredHook to determine fee rates and access control
interface IReputationOracle {
    /// @notice Get the reputation score for a user/agent
    /// @param account The address to query
    /// @return score The reputation score (0-1000 scale)
    function getScore(address account) external view returns (uint256 score);

    /// @notice Check if an account has minimum required reputation
    /// @param account The address to check
    /// @param minScore The minimum score threshold
    /// @return hasReputation True if account meets the threshold
    function hasMinimumReputation(address account, uint256 minScore) external view returns (bool hasReputation);

    /// @notice Get the reputation score for a project/token
    /// @param project The project/token address to query
    /// @return score The project reputation score (0-1000 scale)
    function getProjectScore(address project) external view returns (uint256 score);

    /// @notice Check if an account is blocked (score too low)
    /// @param account The address to check
    /// @return blocked True if account is blocked from trading
    function isBlocked(address account) external view returns (bool blocked);

    /// @notice Emitted when a reputation score changes
    event ScoreUpdated(address indexed account, uint256 oldScore, uint256 newScore);

    /// @notice Emitted when a project score changes
    event ProjectScoreUpdated(address indexed project, uint256 oldScore, uint256 newScore);

    /// @notice Emitted when an account is blocked/unblocked
    event AccountBlocked(address indexed account, bool blocked);
}
