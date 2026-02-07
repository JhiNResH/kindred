// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/KindClawToken.sol";

contract KindClawTokenTest is Test {
    KindClawToken public token;
    address public owner;
    address public user1;
    address public user2;
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        token = new KindClawToken();
    }
    
    function test_InitialSupply() public {
        assertEq(token.totalSupply(), 1_000_000 * 10**18);
        assertEq(token.balanceOf(owner), 1_000_000 * 10**18);
    }
    
    function test_Metadata() public {
        assertEq(token.name(), "KindClaw");
        assertEq(token.symbol(), "KINDCLAW");
        assertEq(token.decimals(), 18);
    }
    
    function test_ClaimFaucet() public {
        vm.prank(user1);
        token.claimFaucet();
        
        assertEq(token.balanceOf(user1), 1000 * 10**18);
    }
    
    function test_ClaimFaucet_Cooldown() public {
        vm.startPrank(user1);
        
        // First claim succeeds
        token.claimFaucet();
        assertEq(token.balanceOf(user1), 1000 * 10**18);
        
        // Second claim fails (cooldown)
        vm.expectRevert();
        token.claimFaucet();
        
        // After 24h, can claim again
        vm.warp(block.timestamp + 24 hours);
        token.claimFaucet();
        assertEq(token.balanceOf(user1), 2000 * 10**18);
        
        vm.stopPrank();
    }
    
    function test_CanClaimFaucet() public {
        // User never claimed
        (bool canClaim, uint256 nextClaim) = token.canClaimFaucet(user1);
        assertTrue(canClaim);
        assertEq(nextClaim, 0);
        
        // User claims
        vm.prank(user1);
        token.claimFaucet();
        
        // User cannot claim immediately
        (canClaim, nextClaim) = token.canClaimFaucet(user1);
        assertFalse(canClaim);
        assertGt(nextClaim, 0);
        
        // After 24h, can claim
        vm.warp(block.timestamp + 24 hours);
        (canClaim, nextClaim) = token.canClaimFaucet(user1);
        assertTrue(canClaim);
        assertEq(nextClaim, 0);
    }
    
    function test_Mint_OnlyOwner() public {
        token.mint(user1, 500 * 10**18);
        assertEq(token.balanceOf(user1), 500 * 10**18);
        
        // Non-owner cannot mint
        vm.prank(user1);
        vm.expectRevert();
        token.mint(user2, 100 * 10**18);
    }
    
    function test_Burn() public {
        // Owner burns
        uint256 initialSupply = token.totalSupply();
        token.burn(100 * 10**18);
        assertEq(token.totalSupply(), initialSupply - 100 * 10**18);
        
        // User burns their own
        vm.prank(user1);
        token.claimFaucet();
        
        vm.prank(user1);
        token.burn(500 * 10**18);
        assertEq(token.balanceOf(user1), 500 * 10**18);
    }
}
