// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KindClawToken
 * @notice $KINDCLAW - Arcade token for Kindred platform
 * 
 * Features:
 * - Faucet: Users can claim 1000 KINDCLAW every 24 hours
 * - Mintable: Owner can mint for future needs
 * - Simple: Easy to upgrade to governance token later
 * 
 * Use Cases:
 * - Stake to write reviews
 * - Spend to upvote/downvote
 * - Trade on Swap (KINDCLAW ↔ OPENWORK, KINDCLAW ↔ USDC)
 * 
 * @author Steve Jobs 🍎 | Team Kindred
 * @dev Built for Circle USDC Hackathon
 */
contract KindClawToken is ERC20, Ownable {
    // ============ Constants ============
    
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**18; // 1000 KINDCLAW
    uint256 public constant FAUCET_COOLDOWN = 24 hours;
    
    // ============ State ============
    
    mapping(address => uint256) public lastFaucetClaim;
    
    // ============ Events ============
    
    event FaucetClaimed(address indexed user, uint256 amount, uint256 nextClaimTime);
    
    // ============ Errors ============
    
    error FaucetOnCooldown(uint256 remainingTime);
    error ZeroAddress();
    
    // ============ Constructor ============
    
    constructor() ERC20("KindClaw", "KINDCLAW") Ownable(msg.sender) {
        // Mint initial supply to deployer for testing
        _mint(msg.sender, 1_000_000 * 10**18); // 1M KINDCLAW
    }
    
    // ============ Faucet Functions ============
    
    /**
     * @notice Claim free KINDCLAW tokens (once per 24h)
     * @dev Users can claim 1000 KINDCLAW every 24 hours
     */
    function claimFaucet() external {
        uint256 lastClaim = lastFaucetClaim[msg.sender];
        
        // Check cooldown (skip if never claimed before)
        if (lastClaim != 0 && block.timestamp < lastClaim + FAUCET_COOLDOWN) {
            uint256 remaining = (lastClaim + FAUCET_COOLDOWN) - block.timestamp;
            revert FaucetOnCooldown(remaining);
        }
        
        // Update last claim time
        lastFaucetClaim[msg.sender] = block.timestamp;
        
        // Mint tokens
        _mint(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp + FAUCET_COOLDOWN);
    }
    
    /**
     * @notice Check if user can claim from faucet
     * @param user Address to check
     * @return canClaim True if can claim now
     * @return nextClaimTime When user can claim next (0 if can claim now)
     */
    function canClaimFaucet(address user) external view returns (bool canClaim, uint256 nextClaimTime) {
        uint256 lastClaim = lastFaucetClaim[user];
        
        if (lastClaim == 0) {
            // Never claimed before
            return (true, 0);
        }
        
        uint256 nextClaim = lastClaim + FAUCET_COOLDOWN;
        
        if (block.timestamp >= nextClaim) {
            return (true, 0);
        } else {
            return (false, nextClaim);
        }
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Mint tokens (owner only)
     * @dev For future needs, airdrops, rewards, etc.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        _mint(to, amount);
    }
    
    /**
     * @notice Burn tokens from own balance
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
