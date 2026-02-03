// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KindToken
 * @notice The native token of the Kindred ecosystem
 * @dev ERC-20 token with permit (gasless approvals) and burn functionality
 * 
 * Use Cases:
 * - Stake to post comments (pay-to-comment)
 * - Vote on comments (upvote/downvote)
 * - Unlock premium content (x402)
 * - Governance (future)
 * 
 * Tokenomics:
 * - Max Supply: 1 billion KIND
 * - Initial mint to deployer for distribution
 * 
 * @author Patrick Collins 🛡️ | Team Kindred
 */
contract KindToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    // ============ Constants ============
    
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18; // 1 billion
    
    // ============ State ============
    
    bool public mintingFinalized;
    
    // ============ Events ============
    
    event MintingFinalized();
    
    // ============ Errors ============
    
    error MintingAlreadyFinalized();
    error ExceedsMaxSupply();
    
    // ============ Constructor ============
    
    constructor(address initialHolder) 
        ERC20("Kindred Token", "KIND")
        ERC20Permit("Kindred Token")
        Ownable(msg.sender)
    {
        // Mint initial supply to holder (for distribution)
        _mint(initialHolder, MAX_SUPPLY);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Finalize minting - no more tokens can be minted
     * @dev One-way function, cannot be undone
     */
    function finalizeMinting() external onlyOwner {
        if (mintingFinalized) revert MintingAlreadyFinalized();
        mintingFinalized = true;
        emit MintingFinalized();
    }
}

/**
 * @title KindTokenTestnet
 * @notice Testnet version with faucet functionality
 * @dev Allows anyone to mint tokens for testing
 */
contract KindTokenTestnet is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    uint256 public constant FAUCET_AMOUNT = 10_000 * 1e18; // 10k per request
    uint256 public constant FAUCET_COOLDOWN = 1 hours;
    
    mapping(address => uint256) public lastFaucetRequest;
    
    error FaucetCooldown();
    
    constructor() 
        ERC20("Kindred Token (Testnet)", "tKIND")
        ERC20Permit("Kindred Token (Testnet)")
        Ownable(msg.sender)
    {
        // Mint initial supply to deployer
        _mint(msg.sender, 100_000_000 * 1e18);
    }
    
    /**
     * @notice Request testnet tokens from faucet
     */
    function faucet() external {
        if (block.timestamp < lastFaucetRequest[msg.sender] + FAUCET_COOLDOWN) {
            revert FaucetCooldown();
        }
        
        lastFaucetRequest[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @notice Admin mint for testing
     */
    function adminMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
