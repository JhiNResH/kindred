// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/KindredHook.sol";
import "../src/ReputationOracle.sol";

contract KindredHookTest is Test {
    KindredHook public hook;
    ReputationOracle public oracle;
    
    address public eliteUser = address(0x1);
    address public trustedUser = address(0x2);
    address public normalUser = address(0x3);
    address public riskyUser = address(0x4);
    address public blockedUser = address(0x5);
    address public lowScoreUser = address(0x6);
    
    function setUp() public {
        oracle = new ReputationOracle();
        hook = new KindredHook(address(oracle));
        oracle.setScore(eliteUser, 950);
        oracle.setScore(trustedUser, 750);
        oracle.setScore(normalUser, 500);
        oracle.setScore(riskyUser, 200);
        oracle.setScore(lowScoreUser, 50);
        oracle.setScore(blockedUser, 800);
        oracle.setBlocked(blockedUser, true);
    }
    
    function test_CalculateFee_AllTiers() public view {
        assertEq(hook.calculateFee(950), 10);
        assertEq(hook.calculateFee(900), 10);
        assertEq(hook.calculateFee(750), 20);
        assertEq(hook.calculateFee(700), 20);
        assertEq(hook.calculateFee(500), 30);
        assertEq(hook.calculateFee(400), 30);
        assertEq(hook.calculateFee(200), 50);
        assertEq(hook.calculateFee(0), 50);
    }
    
    function test_GetFeeForAccount() public view {
        assertEq(hook.getFeeForAccount(eliteUser), 10);
        assertEq(hook.getFeeForAccount(trustedUser), 20);
        assertEq(hook.getFeeForAccount(normalUser), 30);
        assertEq(hook.getFeeForAccount(riskyUser), 50);
    }
    
    function test_CanTrade() public view {
        assertTrue(hook.canTrade(eliteUser));
        assertTrue(hook.canTrade(normalUser));
        assertFalse(hook.canTrade(blockedUser));
        assertFalse(hook.canTrade(lowScoreUser));
    }
    
    function test_ValidateTrade_Success() public view {
        assertEq(hook.validateTrade(eliteUser), 10);
    }
    
    function test_ValidateTrade_RevertBlocked() public {
        vm.expectRevert(abi.encodeWithSelector(KindredHook.AccountBlocked.selector, blockedUser));
        hook.validateTrade(blockedUser);
    }
    
    function test_ValidateTrade_RevertLowScore() public {
        vm.expectRevert(abi.encodeWithSelector(KindredHook.ReputationTooLow.selector, lowScoreUser, 50));
        hook.validateTrade(lowScoreUser);
    }
    
    function test_Constructor_RevertsOnZeroAddress() public {
        vm.expectRevert(KindredHook.ZeroAddress.selector);
        new KindredHook(address(0));
    }
    
    function test_Integration_ReputationUpgrade() public {
        address trader = address(0x100);
        oracle.setScore(trader, 200);
        assertEq(hook.getFeeForAccount(trader), 50);
        oracle.increaseScore(trader, 300);
        assertEq(hook.getFeeForAccount(trader), 30);
        oracle.increaseScore(trader, 250);
        assertEq(hook.getFeeForAccount(trader), 20);
        oracle.increaseScore(trader, 200);
        assertEq(hook.getFeeForAccount(trader), 10);
    }
    
    function testFuzz_CalculateFee_Valid(uint256 score) public view {
        uint24 fee = hook.calculateFee(score);
        assertTrue(fee == 10 || fee == 20 || fee == 30 || fee == 50);
    }
    
    function testFuzz_Monotonic(uint256 s1, uint256 s2) public view {
        if (s1 >= s2) assertTrue(hook.calculateFee(s1) <= hook.calculateFee(s2));
    }
}
