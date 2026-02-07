// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KindClaw
 * @notice Arcade token for Clawathon - mintable testnet token with faucet
 * @dev Hackathon version: free faucet, upgradeable to governance token later
 */
contract KindClaw is ERC20, Ownable {
    // Faucet settings
    uint256 public constant FAUCET_AMOUNT = 100 * 10**18; // 100 KINDCLAW per claim
    uint256 public constant FAUCET_COOLDOWN = 1 hours; // Claim once per hour
    
    mapping(address => uint256) public lastClaim;
    
    event FaucetClaim(address indexed user, uint256 amount, uint256 timestamp);
    
    constructor() ERC20("KindClaw", "KINDCLAW") Ownable(msg.sender) {
        // Mint initial supply to deployer for liquidity
        _mint(msg.sender, 1_000_000 * 10**18); // 1M KINDCLAW
    }
    
    /**
     * @notice Claim free tokens from faucet (testnet only)
     */
    function claimFaucet() external {
        require(
            lastClaim[msg.sender] == 0 || block.timestamp >= lastClaim[msg.sender] + FAUCET_COOLDOWN,
            "KindClaw: Cooldown active"
        );
        
        lastClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetClaim(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }
    
    /**
     * @notice Check if user can claim from faucet
     */
    function canClaim(address user) external view returns (bool) {
        return lastClaim[user] == 0 || block.timestamp >= lastClaim[user] + FAUCET_COOLDOWN;
    }
    
    /**
     * @notice Get time until next claim
     */
    function timeUntilNextClaim(address user) external view returns (uint256) {
        if (lastClaim[user] == 0) return 0; // Can claim immediately
        uint256 nextClaim = lastClaim[user] + FAUCET_COOLDOWN;
        if (block.timestamp >= nextClaim) return 0;
        return nextClaim - block.timestamp;
    }
    
    /**
     * @notice Mint tokens (owner only, for liquidity provision)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @notice Burn tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
