// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/KindClaw.sol";

contract KindClawTest is Test {
    KindClaw public token;
    address public owner = address(this);
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    
    function setUp() public {
        token = new KindClaw();
    }
    
    function test_InitialSupply() public view {
        assertEq(token.totalSupply(), 1_000_000 * 10**18);
        assertEq(token.balanceOf(owner), 1_000_000 * 10**18);
    }
    
    function test_FaucetClaim() public {
        vm.prank(user1);
        token.claimFaucet();
        
        assertEq(token.balanceOf(user1), 100 * 10**18);
    }
    
    function test_FaucetCooldown() public {
        vm.startPrank(user1);
        
        token.claimFaucet();
        
        vm.expectRevert("KindClaw: Cooldown active");
        token.claimFaucet();
        
        vm.warp(block.timestamp + 1 hours);
        token.claimFaucet(); // Should work now
        
        assertEq(token.balanceOf(user1), 200 * 10**18);
        
        vm.stopPrank();
    }
    
    function test_CanClaim() public {
        assertTrue(token.canClaim(user1));
        
        vm.prank(user1);
        token.claimFaucet();
        
        assertFalse(token.canClaim(user1));
        
        vm.warp(block.timestamp + 1 hours);
        assertTrue(token.canClaim(user1));
    }
    
    function test_TimeUntilNextClaim() public {
        assertEq(token.timeUntilNextClaim(user1), 0);
        
        vm.prank(user1);
        token.claimFaucet();
        
        assertEq(token.timeUntilNextClaim(user1), 1 hours);
        
        vm.warp(block.timestamp + 30 minutes);
        assertEq(token.timeUntilNextClaim(user1), 30 minutes);
    }
    
    function test_Mint() public {
        token.mint(user1, 1000 * 10**18);
        assertEq(token.balanceOf(user1), 1000 * 10**18);
    }
    
    function test_Burn() public {
        vm.prank(user1);
        token.claimFaucet();
        
        vm.prank(user1);
        token.burn(50 * 10**18);
        
        assertEq(token.balanceOf(user1), 50 * 10**18);
    }
}
