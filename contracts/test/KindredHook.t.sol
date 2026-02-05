// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/KindredHook.sol";
import "../src/ReputationOracle.sol";

/// @title Mock PoolManager for testing
contract MockPoolManager {
    function getLock(uint256) external pure returns (address, address) {
        return (address(0), address(0));
    }
}

contract KindredHookTest is Test {
    KindredHook public hook;
    ReputationOracle public oracle;
    MockPoolManager public poolManager;
    
    address public owner = address(this);
    address public eliteUser = address(0x1);
    address public trustedUser = address(0x2);
    address public normalUser = address(0x3);
    address public riskyUser = address(0x4);
    address public blockedUser = address(0x5);
    address public lowScoreUser = address(0x6);
    
    event SwapWithReputation(address indexed trader, uint256 reputationScore, uint24 feeApplied, uint256 timestamp);
    event TradeBlocked(address indexed trader, uint256 reputationScore, string reason);
    
    function setUp() public {
        oracle = new ReputationOracle();
        poolManager = new MockPoolManager();
        hook = new KindredHook(address(oracle), address(poolManager));
        
        // Set up test users with different reputation levels
        oracle.setScore(eliteUser, 950);
        oracle.setScore(trustedUser, 750);
        oracle.setScore(normalUser, 500);
        oracle.setScore(riskyUser, 200);
        oracle.setScore(lowScoreUser, 50);
        oracle.setScore(blockedUser, 800);
        oracle.setBlocked(blockedUser, true);
    }
    
    // ============================================
    // FEE CALCULATION TESTS
    // ============================================
    
    function test_CalculateFee_AllTiers() public view {
        assertEq(hook.calculateFee(950), 10, "Elite tier (>=900) should be 10 bp");
        assertEq(hook.calculateFee(900), 10, "Elite threshold should be 10 bp");
        assertEq(hook.calculateFee(750), 20, "Trusted tier (>=700) should be 20 bp");
        assertEq(hook.calculateFee(700), 20, "Trusted threshold should be 20 bp");
        assertEq(hook.calculateFee(500), 30, "Normal tier (>=400) should be 30 bp");
        assertEq(hook.calculateFee(400), 30, "Normal threshold should be 30 bp");
        assertEq(hook.calculateFee(200), 50, "Risky tier (<400) should be 50 bp");
        assertEq(hook.calculateFee(0), 50, "Zero score should be 50 bp");
    }
    
    function test_GetFeeForAccount() public view {
        assertEq(hook.getFeeForAccount(eliteUser), 10);
        assertEq(hook.getFeeForAccount(trustedUser), 20);
        assertEq(hook.getFeeForAccount(normalUser), 30);
        assertEq(hook.getFeeForAccount(riskyUser), 50);
    }
    
    // ============================================
    // TRADE VALIDATION TESTS
    // ============================================
    
    function test_CanTrade() public view {
        assertTrue(hook.canTrade(eliteUser), "Elite user should be able to trade");
        assertTrue(hook.canTrade(normalUser), "Normal user should be able to trade");
        assertFalse(hook.canTrade(blockedUser), "Blocked user should not be able to trade");
        assertFalse(hook.canTrade(lowScoreUser), "Low score user should not be able to trade");
    }
    
    function test_ValidateTrade_Success() public view {
        assertEq(hook.validateTrade(eliteUser), 10);
        assertEq(hook.validateTrade(trustedUser), 20);
    }
    
    function test_ValidateTrade_RevertBlocked() public {
        vm.expectRevert(abi.encodeWithSelector(KindredHook.AccountBlocked.selector, blockedUser));
        hook.validateTrade(blockedUser);
    }
    
    function test_ValidateTrade_RevertLowScore() public {
        vm.expectRevert(abi.encodeWithSelector(KindredHook.ReputationTooLow.selector, lowScoreUser, 50));
        hook.validateTrade(lowScoreUser);
    }
    
    // ============================================
    // HOOK CALLBACK TESTS (v4 Interface)
    // ============================================
    
    function test_BeforeSwap_Success() public {
        bytes memory hookData = "";
        
        vm.expectEmit(true, true, true, true);
        emit SwapWithReputation(eliteUser, 950, 10, block.timestamp);
        
        (bytes4 selector, uint24 fee) = hook.beforeSwap(eliteUser, "", hookData);
        
        assertEq(selector, hook.beforeSwap.selector, "Should return correct selector");
        assertEq(fee, 10, "Should apply elite fee");
    }
    
    function test_BeforeSwap_WithHookData() public {
        // Simulate router passing actual trader address in hookData
        bytes memory hookData = abi.encodePacked(eliteUser);
        address router = address(0x999);
        
        vm.expectEmit(true, true, true, true);
        emit SwapWithReputation(eliteUser, 950, 10, block.timestamp);
        
        (bytes4 selector, uint24 fee) = hook.beforeSwap(router, "", hookData);
        
        assertEq(selector, hook.beforeSwap.selector);
        assertEq(fee, 10, "Should extract trader from hookData");
    }
    
    function test_BeforeSwap_RevertBlocked() public {
        // After M-2 fix: blocked accounts return score = 0 from getScore()
        vm.expectEmit(true, true, true, true);
        emit TradeBlocked(blockedUser, 0, "Account blocked by oracle");
        
        vm.expectRevert(abi.encodeWithSelector(KindredHook.AccountBlocked.selector, blockedUser));
        hook.beforeSwap(blockedUser, "", "");
    }
    
    function test_BeforeSwap_RevertLowScore() public {
        vm.expectEmit(true, true, true, true);
        emit TradeBlocked(lowScoreUser, 50, "Reputation too low");
        
        vm.expectRevert(abi.encodeWithSelector(KindredHook.ReputationTooLow.selector, lowScoreUser, 50));
        hook.beforeSwap(lowScoreUser, "", "");
    }
    
    function test_AfterSwap() public view {
        bytes4 selector = hook.afterSwap(eliteUser, "", "");
        assertEq(selector, hook.afterSwap.selector, "Should return correct selector");
    }
    
    // ============================================
    // PAUSABLE TESTS
    // ============================================
    
    function test_Pause() public {
        hook.pause();
        
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        hook.beforeSwap(eliteUser, "", "");
    }
    
    function test_Unpause() public {
        hook.pause();
        hook.unpause();
        
        // Should work after unpause
        (bytes4 selector, uint24 fee) = hook.beforeSwap(eliteUser, "", "");
        assertEq(selector, hook.beforeSwap.selector);
        assertEq(fee, 10);
    }
    
    function test_Pause_OnlyOwner() public {
        vm.prank(address(0xdead));
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", address(0xdead)));
        hook.pause();
    }
    
    // ============================================
    // CONSTRUCTOR TESTS
    // ============================================
    
    function test_Constructor_RevertsOnZeroOracle() public {
        vm.expectRevert(KindredHook.ZeroAddress.selector);
        new KindredHook(address(0), address(poolManager));
    }
    
    function test_Constructor_RevertsOnZeroPoolManager() public {
        vm.expectRevert(KindredHook.ZeroAddress.selector);
        new KindredHook(address(oracle), address(0));
    }
    
    // ============================================
    // INTEGRATION TESTS
    // ============================================
    
    function test_Integration_ReputationUpgrade() public {
        address trader = address(0x100);
        
        oracle.setScore(trader, 200);
        assertEq(hook.getFeeForAccount(trader), 50, "Should start with risky fee");
        
        oracle.increaseScore(trader, 300);
        assertEq(hook.getFeeForAccount(trader), 30, "Should upgrade to normal fee");
        
        oracle.increaseScore(trader, 250);
        assertEq(hook.getFeeForAccount(trader), 20, "Should upgrade to trusted fee");
        
        oracle.increaseScore(trader, 200);
        assertEq(hook.getFeeForAccount(trader), 10, "Should upgrade to elite fee");
    }
    
    function test_Integration_FullSwapFlow() public {
        // 1. Check if can trade
        assertTrue(hook.canTrade(normalUser));
        
        // 2. Get expected fee
        uint24 expectedFee = hook.getFeeForAccount(normalUser);
        assertEq(expectedFee, 30);
        
        // 3. Execute beforeSwap
        (bytes4 selector, uint24 actualFee) = hook.beforeSwap(normalUser, "", "");
        assertEq(selector, hook.beforeSwap.selector);
        assertEq(actualFee, expectedFee);
        
        // 4. Execute afterSwap
        bytes4 afterSelector = hook.afterSwap(normalUser, "", "");
        assertEq(afterSelector, hook.afterSwap.selector);
    }
    
    // ============================================
    // FUZZ TESTS
    // ============================================
    
    function testFuzz_CalculateFee_Valid(uint256 score) public view {
        uint24 fee = hook.calculateFee(score);
        assertTrue(fee == 10 || fee == 20 || fee == 30 || fee == 50, "Fee must be one of the valid tiers");
    }
    
    function testFuzz_FeeMonotonicity(uint256 s1, uint256 s2) public view {
        // Higher score should have lower or equal fee
        if (s1 >= s2) {
            assertTrue(hook.calculateFee(s1) <= hook.calculateFee(s2), "Fee should be monotonic");
        }
    }
    
    function testFuzz_BeforeSwap_ValidScores(uint256 score) public {
        vm.assume(score >= 100 && score <= 1000); // Valid reputation range
        
        address trader = address(uint160(uint256(keccak256(abi.encode(score))))); // Generate unique address
        oracle.setScore(trader, score);
        
        (bytes4 selector, uint24 fee) = hook.beforeSwap(trader, "", "");
        
        assertEq(selector, hook.beforeSwap.selector);
        assertTrue(fee >= 10 && fee <= 50, "Fee must be within valid range");
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    function test_GetHookPermissions() public view {
        uint160 permissions = hook.getHookPermissions();
        assertEq(permissions, 0x0003, "Should enable beforeSwap (0x0001) and afterSwap (0x0002)");
    }
}
