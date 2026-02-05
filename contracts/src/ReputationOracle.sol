// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ReputationOracle is Ownable {
    mapping(address => uint256) public scores;
    mapping(address => uint256) public projectScores;
    mapping(address => bool) public blocked;
    mapping(address => bool) public updaters;
    
    uint256 public constant MAX_SCORE = 1000;
    uint256 public constant DEFAULT_SCORE = 500;
    uint256 public constant MAX_BATCH_SIZE = 50;
    
    event ScoreUpdated(address indexed account, uint256 oldScore, uint256 newScore, address indexed updater);
    event ProjectScoreUpdated(address indexed project, uint256 oldScore, uint256 newScore);
    event AccountBlocked(address indexed account, bool blocked);
    event UpdaterSet(address indexed updater, bool authorized);
    
    error NotAuthorized();
    error ScoreTooHigh(uint256 score);
    error ZeroAddress();
    error BatchTooLarge(uint256 size);
    error ArrayLengthMismatch();
    
    modifier onlyUpdater() {
        if (!updaters[msg.sender] && msg.sender != owner()) revert NotAuthorized();
        _;
    }
    
    constructor() Ownable(msg.sender) {
        updaters[msg.sender] = true;
    }
    
    function getScore(address account) external view returns (uint256) {
        // Blocked accounts always return 0 (explicit behavior)
        if (blocked[account]) return 0;
        
        // Return stored score, or DEFAULT_SCORE if never set
        uint256 score = scores[account];
        return score == 0 ? DEFAULT_SCORE : score;
    }
    
    function isBlocked(address account) external view returns (bool) { 
        return blocked[account]; 
    }
    
    function hasMinimumReputation(address account, uint256 minScore) external view returns (bool) {
        uint256 score = scores[account];
        if (score == 0 && !blocked[account]) score = DEFAULT_SCORE;
        return score >= minScore;
    }
    
    function getProjectScore(address project) external view returns (uint256) {
        uint256 score = projectScores[project];
        if (score == 0) return DEFAULT_SCORE;
        return score;
    }
    
    function setProjectScore(address project, uint256 score) external onlyUpdater {
        if (project == address(0)) revert ZeroAddress();
        if (score > MAX_SCORE) revert ScoreTooHigh(score);
        uint256 oldScore = projectScores[project];
        projectScores[project] = score;
        emit ProjectScoreUpdated(project, oldScore, score);
    }
    
    function setScore(address account, uint256 score) external onlyUpdater {
        if (account == address(0)) revert ZeroAddress();
        if (score > MAX_SCORE) revert ScoreTooHigh(score);
        uint256 oldScore = scores[account];
        scores[account] = score;
        emit ScoreUpdated(account, oldScore, score, msg.sender);
    }
    
    function batchSetScores(address[] calldata accounts, uint256[] calldata _scores) external onlyUpdater {
        if (accounts.length != _scores.length) revert ArrayLengthMismatch();
        if (accounts.length > MAX_BATCH_SIZE) revert BatchTooLarge(accounts.length);
        for (uint256 i = 0; i < accounts.length; i++) {
            if (accounts[i] == address(0)) revert ZeroAddress();
            if (_scores[i] > MAX_SCORE) revert ScoreTooHigh(_scores[i]);
            uint256 oldScore = scores[accounts[i]];
            scores[accounts[i]] = _scores[i];
            emit ScoreUpdated(accounts[i], oldScore, _scores[i], msg.sender);
        }
    }
    
    function setBlocked(address account, bool _blocked) external onlyUpdater {
        if (account == address(0)) revert ZeroAddress();
        blocked[account] = _blocked;
        emit AccountBlocked(account, _blocked);
    }
    
    function setUpdater(address updater, bool authorized) external onlyOwner {
        if (updater == address(0)) revert ZeroAddress();
        updaters[updater] = authorized;
        emit UpdaterSet(updater, authorized);
    }
    
    function increaseScore(address account, uint256 delta) external onlyUpdater {
        if (account == address(0)) revert ZeroAddress();
        
        // Use getScore() logic for consistency (blocked accounts can't increase score)
        if (blocked[account]) return; // Skip increasing score for blocked accounts
        
        uint256 currentScore = scores[account];
        if (currentScore == 0) currentScore = DEFAULT_SCORE;
        
        uint256 newScore = currentScore + delta;
        if (newScore > MAX_SCORE) newScore = MAX_SCORE;
        
        scores[account] = newScore;
        emit ScoreUpdated(account, currentScore, newScore, msg.sender);
    }
    
    function decreaseScore(address account, uint256 delta) external onlyUpdater {
        if (account == address(0)) revert ZeroAddress();
        
        // Use getScore() logic for consistency
        if (blocked[account]) return; // Skip decreasing score for blocked accounts
        
        uint256 currentScore = scores[account];
        if (currentScore == 0) currentScore = DEFAULT_SCORE;
        
        uint256 newScore = currentScore > delta ? currentScore - delta : 0;
        scores[account] = newScore;
        emit ScoreUpdated(account, currentScore, newScore, msg.sender);
    }
}
