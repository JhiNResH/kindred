// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title OpenWorkMock
 * @notice Mock $OPENWORK token for Base Sepolia testing
 * 
 * Real mainnet address: 0x299c30dd5974bf4d5bfe42d340ca40462816ab07
 * This is a testnet mock with faucet for development
 * 
 * @author Steve Jobs 🍎 | Team Kindred
 */
contract OpenWorkMock is ERC20 {
    uint256 public constant FAUCET_AMOUNT = 100 * 10**18; // 100 OPENWORK
    uint256 public constant FAUCET_COOLDOWN = 24 hours;
    
    mapping(address => uint256) public lastFaucetClaim;
    
    error FaucetOnCooldown(uint256 remainingTime);
    
    constructor() ERC20("OpenWork Mock", "OPENWORK") {
        // Mint initial supply for testing
        _mint(msg.sender, 10_000_000 * 10**18); // 10M OPENWORK
    }
    
    /**
     * @notice Claim free OPENWORK tokens (testnet only)
     */
    function claimFaucet() external {
        uint256 lastClaim = lastFaucetClaim[msg.sender];
        
        if (lastClaim != 0 && block.timestamp < lastClaim + FAUCET_COOLDOWN) {
            uint256 remaining = (lastClaim + FAUCET_COOLDOWN) - block.timestamp;
            revert FaucetOnCooldown(remaining);
        }
        
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @notice Check if user can claim
     */
    function canClaimFaucet(address user) external view returns (bool canClaim, uint256 nextClaimTime) {
        uint256 lastClaim = lastFaucetClaim[user];
        
        if (lastClaim == 0) return (true, 0);
        
        uint256 nextClaim = lastClaim + FAUCET_COOLDOWN;
        
        if (block.timestamp >= nextClaim) {
            return (true, 0);
        } else {
            return (false, nextClaim);
        }
    }
}
