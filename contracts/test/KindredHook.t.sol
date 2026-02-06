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
    address public highTrustUser = address(0x1);    // >= 850
    address public mediumTrustUser = address(0x2);  // 600-849
    address public lowTrustUser = address(0x3);     // < 600
    address public veryLowUser = address(0x4);      // < 600
    address public blockedUser = address(0x5);
    address public minScoreUser = address(0x6);     // Just above MIN_SCORE_TO_TRADE
    
    event SwapWithReputation(address indexed trader, uint256 reputationScore, uint24 feeApplied, uint256 timestamp);
    event TradeBlocked(address indexed trader, uint256 reputationScore, string reason);
    
    function setUp() public {
        oracle = new ReputationOracle();
        poolManager = new MockPoolManager();
        hook = new KindredHook(address(oracle), address(poolManager));
        
        // Set up test users with different reputation levels
        oracle.setScore(highTrustUser, 900);     // 0.15% fee
        oracle.setScore(mediumTrustUser, 700);   // 0.22% fee
        oracle.setScore(lowTrustUser, 500);      // 0.30% fee
        oracle.setScore(veryLowUser, 200);       // 0.30% fee
        oracle.setScore(minScoreUser, 150);      // 0.30% fee (above MIN 100)
        oracle.setScore(blockedUser, 800);
        oracle.setBlocked(blockedUser, true);
    }
    
    // ============================================
    // FEE CALCULATION TESTS
    // ============================================
    
    function test_CalculateFee_AllTiers() public view {
        assertEq(hook.calculateFee(1000), 15, "Max score should be 15 bp");
        assertEq(hook.calculateFee(900), 15, "High trust tier (>=850) should be 15 bp");
        assertEq(hook.calculateFee(850), 15, "High trust threshold should be 15 bp");
        assertEq(hook.calculateFee(849), 22, "Medium trust tier (600-849) should be 22 bp");
        assertEq(hook.calculateFee(700), 22, "Medium trust mid should be 22 bp");
        assertEq(hook.calculateFee(600), 22, "Medium trust threshold should be 22 bp");
        assertEq(hook.calculateFee(599), 30, "Low trust tier (<600) should be 30 bp");
        assertEq(hook.calculateFee(500), 30, "Low trust mid should be 30 bp");
        assertEq(hook.calculateFee(100), 30, "Low trust min should be 30 bp");
        assertEq(hook.calculateFee(0), 30, "Zero score should be 30 bp");
    }
    
    function test_GetFeeForAccount() public view {
        assertEq(hook.getFeeForAccount(highTrustUser), 15);
        assertEq(hook.getFeeForAccount(mediumTrustUser), 22);
        assertEq(hook.getFeeForAccount(lowTrustUser), 30);
        assertEq(hook.getFeeForAccount(veryLowUser), 30);
    }
    
    // ============================================
    // TRADE VALIDATION TESTS
    // ============================================
    
    function test_CanTrade() public view {
        assertTrue(hook.canTrade(highTrustUser), "High trust user should be able to trade");
        assertTrue(hook.canTrade(lowTrustUser), "Low trust user should be able to trade");
        assertTrue(hook.canTrade(minScoreUser), "User above MIN_SCORE_TO_TRADE should trade");
        assertFalse(hook.canTrade(blockedUser), "Blocked user should not be able to trade");
    }
    
    function test_ValidateTrade_Success() public view {
        assertEq(hook.validateTrade(highTrustUser), 15);
        assertEq(hook.validateTrade(mediumTrustUser), 22);
        assertEq(hook.validateTrade(lowTrustUser), 30);
    }
    
    function test_ValidateTrade_RevertBlocked() public {
        vm.expectRevert(abi.encodeWithSelector(KindredHook.AccountBlocked.selector, blockedUser));
        hook.validateTrade(blockedUser);
    }
    
    function test_ValidateTrade_RevertLowScore() public {
        // Create a user with score below MIN_SCORE_TO_TRADE (100)
        address tooLowUser = address(0x999);
        oracle.setScore(tooLowUser, 50);
        
        vm.expectRevert(abi.encodeWithSelector(KindredHook.ReputationTooLow.selector, tooLowUser, 50));
        hook.validateTrade(tooLowUser);
    }
    
    // ============================================
    // HOOK CALLBACK TESTS (v4 Interface)
    // ============================================
    
    function test_BeforeSwap_Success() public {
        bytes memory hookData = "";
        
        vm.expectEmit(true, true, true, true);
        emit SwapWithReputation(highTrustUser, 900, 15, block.timestamp);
        
        (bytes4 selector, uint24 fee) = hook.beforeSwap(highTrustUser, "", hookData);
        
        assertEq(selector, hook.beforeSwap.selector, "Should return correct selector");
        assertEq(fee, 15, "Should apply high trust fee");
    }
    
    function test_BeforeSwap_WithHookData() public {
        // Simulate router passing actual trader address in hookData
        bytes memory hookData = abi.encodePacked(highTrustUser);
        address router = address(0x999);
        
        vm.expectEmit(true, true, true, true);
        emit SwapWithReputation(highTrustUser, 900, 15, block.timestamp);
        
        (bytes4 selector, uint24 fee) = hook.beforeSwap(router, "", hookData);
        
        assertEq(selector, hook.beforeSwap.selector);
        assertEq(fee, 15, "Should extract trader from hookData");
    }
    
    function test_BeforeSwap_RevertBlocked() public {
        // After M-2 fix: blocked accounts return score = 0 from getScore()
        vm.expectEmit(true, true, true, true);
        emit TradeBlocked(blockedUser, 0, "Account blocked by oracle");
        
        vm.expectRevert(abi.encodeWithSelector(KindredHook.AccountBlocked.selector, blockedUser));
        hook.beforeSwap(blockedUser, "", "");
    }
    
    function test_BeforeSwap_RevertLowScore() public {
        address tooLowUser = address(0x999);
        oracle.setScore(tooLowUser, 50);
        
        vm.expectEmit(true, true, true, true);
        emit TradeBlocked(tooLowUser, 50, "Reputation too low");
        
        vm.expectRevert(abi.encodeWithSelector(KindredHook.ReputationTooLow.selector, tooLowUser, 50));
        hook.beforeSwap(tooLowUser, "", "");
    }
    
    function test_AfterSwap() public view {
        bytes4 selector = hook.afterSwap(highTrustUser, "", "");
        assertEq(selector, hook.afterSwap.selector, "Should return correct selector");
    }
    
    // ============================================
    // PAUSABLE TESTS
    // ============================================
    
    function test_Pause() public {
        hook.pause();
        
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        hook.beforeSwap(highTrustUser, "", "");
    }
    
    function test_Unpause() public {
        hook.pause();
        hook.unpause();
        
        // Should work after unpause
        (bytes4 selector, uint24 fee) = hook.beforeSwap(highTrustUser, "", "");
        assertEq(selector, hook.beforeSwap.selector);
        assertEq(fee, 15);
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
        assertEq(hook.getFeeForAccount(trader), 30, "Should start with low trust fee");
        
        oracle.increaseScore(trader, 450);
        assertEq(hook.getFeeForAccount(trader), 22, "Should upgrade to medium trust fee");
        
        oracle.increaseScore(trader, 250);
        assertEq(hook.getFeeForAccount(trader), 15, "Should upgrade to high trust fee");
    }
    
    function test_Integration_FullSwapFlow() public {
        // 1. Check if can trade
        assertTrue(hook.canTrade(lowTrustUser));
        
        // 2. Get expected fee
        uint24 expectedFee = hook.getFeeForAccount(lowTrustUser);
        assertEq(expectedFee, 30);
        
        // 3. Execute beforeSwap
        (bytes4 selector, uint24 actualFee) = hook.beforeSwap(lowTrustUser, "", "");
        assertEq(selector, hook.beforeSwap.selector);
        assertEq(actualFee, expectedFee);
        
        // 4. Execute afterSwap
        bytes4 afterSelector = hook.afterSwap(lowTrustUser, "", "");
        assertEq(afterSelector, hook.afterSwap.selector);
    }
    
    // ============================================
    // FUZZ TESTS
    // ============================================
    
    function testFuzz_CalculateFee_Valid(uint256 score) public view {
        uint24 fee = hook.calculateFee(score);
        assertTrue(fee == 15 || fee == 22 || fee == 30, "Fee must be one of: 15, 22, or 30 bp");
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
        assertTrue(fee >= 15 && fee <= 30, "Fee must be within valid range (15-30 bp)");
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    function test_GetHookPermissions() public view {
        uint160 permissions = hook.getHookPermissions();
        assertEq(permissions, 0x0003, "Should enable beforeSwap (0x0001) and afterSwap (0x0002)");
    }
}
