// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/KindredHook.sol";
import "../src/KindredReputationOracle.sol";
import "../src/KindredComment.sol";
import "../src/KindToken.sol";

/// @title Mock PoolManager for testing
contract MockPoolManager {
    function getLock(uint256) external pure returns (address, address) {
        return (address(0), address(0));
    }
}

/**
 * @title KindredHookIntegrationTest
 * @notice Integration tests for KindredHook with KindredReputationOracle
 * @dev Tests the full flow: comments → reputation → dynamic fees
 */
contract KindredHookIntegrationTest is Test {
    KindredHook public hook;
    KindredReputationOracle public oracle;
    KindredComment public commentNFT;
    KindTokenTestnet public kindToken;
    MockPoolManager public poolManager;
    
    address public owner = address(this);
    address public treasury = address(0x999);
    
    // Test users representing different reputation tiers
    address public highTrustUser = address(0x1);   // Score >= 850 → 0.15% fee
    address public mediumTrustUser = address(0x2); // Score 600-849 → 0.22% fee
    address public lowTrustUser = address(0x3);    // Score < 600 → 0.30% fee
    address public newUser = address(0x4);         // No activity → 0.30% fee (base 500)
    
    bytes32 public projectId = keccak256("TestProject");
    
    event SwapWithReputation(address indexed trader, uint256 reputationScore, uint24 feeApplied, uint256 timestamp);
    
    function setUp() public {
        // Deploy full stack
        kindToken = new KindTokenTestnet();
        commentNFT = new KindredComment(address(kindToken), treasury);
        oracle = new KindredReputationOracle(address(commentNFT));
        poolManager = new MockPoolManager();
        hook = new KindredHook(address(oracle), address(poolManager));
        
        // Mint tokens
        kindToken.adminMint(highTrustUser, 10000e18);
        kindToken.adminMint(mediumTrustUser, 10000e18);
        kindToken.adminMint(lowTrustUser, 10000e18);
        
        // Approve
        vm.prank(highTrustUser);
        kindToken.approve(address(commentNFT), type(uint256).max);
        vm.prank(mediumTrustUser);
        kindToken.approve(address(commentNFT), type(uint256).max);
        vm.prank(lowTrustUser);
        kindToken.approve(address(commentNFT), type(uint256).max);
        
        // Build reputation for test users
        _buildHighTrustReputation();
        _buildMediumTrustReputation();
        _buildLowTrustReputation();
    }
    
    function _buildHighTrustReputation() internal {
        // Create multiple quality comments
        vm.startPrank(highTrustUser);
        for (uint256 i = 0; i < 5; i++) {
            commentNFT.createComment(projectId, "High quality analysis", "", 0, 0);
        }
        vm.stopPrank();
        
        // Get many upvotes
        kindToken.adminMint(address(0x100), 10000e18);
        vm.startPrank(address(0x100));
        kindToken.approve(address(commentNFT), type(uint256).max);
        for (uint256 tokenId = 0; tokenId < 5; tokenId++) {
            commentNFT.upvote(tokenId, 80e18);
        }
        vm.stopPrank();
        
        // Verify score >= 850
        uint256 score = oracle.getScore(highTrustUser);
        assertGe(score, 850, "High trust user should have score >= 850");
    }
    
    function _buildMediumTrustReputation() internal {
        // Create moderate comments
        vm.startPrank(mediumTrustUser);
        for (uint256 i = 0; i < 3; i++) {
            commentNFT.createComment(projectId, "Decent content", "", 0, 0);
        }
        vm.stopPrank();
        
        // Get some upvotes
        kindToken.adminMint(address(0x101), 10000e18);
        vm.startPrank(address(0x101));
        kindToken.approve(address(commentNFT), type(uint256).max);
        for (uint256 tokenId = 5; tokenId < 8; tokenId++) {
            commentNFT.upvote(tokenId, 40e18);
        }
        vm.stopPrank();
        
        // Verify score in [600, 849]
        uint256 score = oracle.getScore(mediumTrustUser);
        assertGe(score, 600, "Medium trust user should have score >= 600");
        assertLt(score, 850, "Medium trust user should have score < 850");
    }
    
    function _buildLowTrustReputation() internal {
        // Create one comment
        vm.prank(lowTrustUser);
        uint256 tokenId = commentNFT.createComment(projectId, "Low effort", "", 0, 0);
        
        // Get downvoted
        kindToken.adminMint(address(0x102), 10000e18);
        vm.startPrank(address(0x102));
        kindToken.approve(address(commentNFT), type(uint256).max);
        commentNFT.downvote(tokenId, 50e18);
        vm.stopPrank();
        
        // Verify score < 600
        uint256 score = oracle.getScore(lowTrustUser);
        assertLt(score, 600, "Low trust user should have score < 600");
    }
    
    // ============================================
    // FEE TIER TESTS
    // ============================================
    
    function test_HighTrustUser_GetsFee015() public {
        uint256 score = oracle.getScore(highTrustUser);
        console.log("High trust score:", score);
        
        uint24 fee = hook.getFeeForAccount(highTrustUser);
        assertEq(fee, 15, "High trust user (>= 850) should get 0.15% fee");
    }
    
    function test_MediumTrustUser_GetsFee022() public {
        uint256 score = oracle.getScore(mediumTrustUser);
        console.log("Medium trust score:", score);
        
        uint24 fee = hook.getFeeForAccount(mediumTrustUser);
        assertEq(fee, 22, "Medium trust user (600-849) should get 0.22% fee");
    }
    
    function test_LowTrustUser_GetsFee030() public {
        uint256 score = oracle.getScore(lowTrustUser);
        console.log("Low trust score:", score);
        
        uint24 fee = hook.getFeeForAccount(lowTrustUser);
        assertEq(fee, 30, "Low trust user (< 600) should get 0.30% fee");
    }
    
    function test_NewUser_GetsFee030() public {
        uint256 score = oracle.getScore(newUser);
        console.log("New user score:", score);
        
        // New user has BASE_SCORE (500) → low trust fee
        assertEq(score, 500, "New user should have BASE_SCORE");
        
        uint24 fee = hook.getFeeForAccount(newUser);
        assertEq(fee, 30, "New user should get 0.30% fee");
    }
    
    // ============================================
    // BEFORESWAP INTEGRATION TESTS
    // ============================================
    
    function test_BeforeSwap_HighTrustUser() public {
        vm.expectEmit(true, true, true, true);
        emit SwapWithReputation(highTrustUser, oracle.getScore(highTrustUser), 15, block.timestamp);
        
        (bytes4 selector, uint24 fee) = hook.beforeSwap(highTrustUser, "", "");
        
        assertEq(selector, hook.beforeSwap.selector);
        assertEq(fee, 15);
    }
    
    function test_BeforeSwap_MediumTrustUser() public {
        vm.expectEmit(true, true, true, true);
        emit SwapWithReputation(mediumTrustUser, oracle.getScore(mediumTrustUser), 22, block.timestamp);
        
        (bytes4 selector, uint24 fee) = hook.beforeSwap(mediumTrustUser, "", "");
        
        assertEq(selector, hook.beforeSwap.selector);
        assertEq(fee, 22);
    }
    
    function test_BeforeSwap_LowTrustUser() public {
        vm.expectEmit(true, true, true, true);
        emit SwapWithReputation(lowTrustUser, oracle.getScore(lowTrustUser), 30, block.timestamp);
        
        (bytes4 selector, uint24 fee) = hook.beforeSwap(lowTrustUser, "", "");
        
        assertEq(selector, hook.beforeSwap.selector);
        assertEq(fee, 30);
    }
    
    // ============================================
    // REPUTATION UPGRADE TESTS
    // ============================================
    
    function test_ReputationUpgrade_LowToMedium() public {
        address user = lowTrustUser;
        
        // Start in low trust
        assertEq(hook.getFeeForAccount(user), 30);
        
        // Create more quality comments and get upvotes
        vm.startPrank(user);
        for (uint256 i = 0; i < 5; i++) {
            commentNFT.createComment(projectId, "Improved content", "", 0, 0);
        }
        vm.stopPrank();
        
        kindToken.adminMint(address(0x200), 10000e18);
        vm.startPrank(address(0x200));
        kindToken.approve(address(commentNFT), type(uint256).max);
        for (uint256 tokenId = 8; tokenId < 13; tokenId++) {
            commentNFT.upvote(tokenId, 60e18);
        }
        vm.stopPrank();
        
        // Should upgrade to medium trust
        uint256 newScore = oracle.getScore(user);
        console.log("Upgraded score:", newScore);
        assertGe(newScore, 600, "Should upgrade to medium trust");
        
        assertEq(hook.getFeeForAccount(user), 22);
    }
    
    function test_ReputationUpgrade_MediumToHigh() public {
        address user = mediumTrustUser;
        
        // Start in medium trust
        assertEq(hook.getFeeForAccount(user), 22);
        
        // Create more excellent comments
        vm.startPrank(user);
        for (uint256 i = 0; i < 10; i++) {
            commentNFT.createComment(projectId, "Excellent analysis", "", 0, 0);
        }
        vm.stopPrank();
        
        kindToken.adminMint(address(0x201), 10000e18);
        vm.startPrank(address(0x201));
        kindToken.approve(address(commentNFT), type(uint256).max);
        for (uint256 tokenId = 8; tokenId < 18; tokenId++) {
            commentNFT.upvote(tokenId, 50e18);
        }
        vm.stopPrank();
        
        // Should upgrade to high trust
        uint256 newScore = oracle.getScore(user);
        console.log("Upgraded score:", newScore);
        assertGe(newScore, 850, "Should upgrade to high trust");
        
        assertEq(hook.getFeeForAccount(user), 15);
    }
    
    // ============================================
    // BLOCKED USER TESTS
    // ============================================
    
    function test_BlockedUser_CannotTrade() public {
        oracle.setBlocked(lowTrustUser, true);
        
        assertFalse(hook.canTrade(lowTrustUser));
        
        vm.expectRevert(abi.encodeWithSelector(KindredHook.AccountBlocked.selector, lowTrustUser));
        hook.beforeSwap(lowTrustUser, "", "");
    }
    
    function test_BlockedUser_ScoreIsZero() public {
        // User has reputation from comments
        uint256 scoreBefore = oracle.getScore(lowTrustUser);
        assertGt(scoreBefore, 0);
        
        // Block them
        oracle.setBlocked(lowTrustUser, true);
        
        // Score becomes 0
        uint256 scoreAfter = oracle.getScore(lowTrustUser);
        assertEq(scoreAfter, 0);
    }
    
    // ============================================
    // CALCULATE FEE TESTS
    // ============================================
    
    function test_CalculateFee_ExactThresholds() public view {
        assertEq(hook.calculateFee(850), 15, "Score 850 should be 15 bp");
        assertEq(hook.calculateFee(849), 22, "Score 849 should be 22 bp");
        assertEq(hook.calculateFee(600), 22, "Score 600 should be 22 bp");
        assertEq(hook.calculateFee(599), 30, "Score 599 should be 30 bp");
        assertEq(hook.calculateFee(500), 30, "Score 500 should be 30 bp");
        assertEq(hook.calculateFee(100), 30, "Score 100 should be 30 bp");
    }
    
    function test_CalculateFee_BoundaryValues() public view {
        assertEq(hook.calculateFee(1000), 15, "Max score should be 15 bp");
        assertEq(hook.calculateFee(0), 30, "Zero score should be 30 bp");
    }
    
    // ============================================
    // VALIDATE TRADE TESTS
    // ============================================
    
    function test_ValidateTrade_AllTiers() public view {
        assertEq(hook.validateTrade(highTrustUser), 15);
        assertEq(hook.validateTrade(mediumTrustUser), 22);
        assertEq(hook.validateTrade(lowTrustUser), 30);
    }
    
    function test_ValidateTrade_NewUser() public view {
        // New user with score 500 (BASE_SCORE) should be allowed
        assertEq(hook.validateTrade(newUser), 30);
    }
    
    function test_ValidateTrade_RevertBlockedUser() public {
        oracle.setBlocked(lowTrustUser, true);
        
        vm.expectRevert(abi.encodeWithSelector(KindredHook.AccountBlocked.selector, lowTrustUser));
        hook.validateTrade(lowTrustUser);
    }
    
    // ============================================
    // FULL FLOW INTEGRATION TEST
    // ============================================
    
    function test_FullFlow_NewUserJourney() public {
        address alice = address(0x500);
        kindToken.adminMint(alice, 10000e18);
        
        // 1. New user - gets default fee
        assertEq(oracle.getScore(alice), 500, "New user has BASE_SCORE");
        assertEq(hook.getFeeForAccount(alice), 30, "New user gets 0.30% fee");
        
        // 2. Alice creates quality comments
        vm.startPrank(alice);
        kindToken.approve(address(commentNFT), type(uint256).max);
        for (uint256 i = 0; i < 5; i++) {
            commentNFT.createComment(projectId, "Good content", "", 0, 0);
        }
        vm.stopPrank();
        
        // 3. Gets community upvotes
        // Previous comments: 5 (high) + 3 (medium) + 1 (low) = 9
        // Alice's comments start at tokenId 9
        kindToken.adminMint(address(0x501), 10000e18);
        vm.startPrank(address(0x501));
        kindToken.approve(address(commentNFT), type(uint256).max);
        for (uint256 tokenId = 9; tokenId < 14; tokenId++) {
            commentNFT.upvote(tokenId, 50e18);
        }
        vm.stopPrank();
        
        // 4. Reputation improves → better fee
        uint256 newScore = oracle.getScore(alice);
        console.log("Alice's new score:", newScore);
        assertGe(newScore, 600, "Should reach medium trust");
        assertEq(hook.getFeeForAccount(alice), 22, "Should get 0.22% fee");
        
        // 5. Can now trade with better fee
        assertTrue(hook.canTrade(alice));
        (bytes4 selector, uint24 fee) = hook.beforeSwap(alice, "", "");
        assertEq(selector, hook.beforeSwap.selector);
        assertEq(fee, 22);
    }
    
    // ============================================
    // FUZZ TESTS
    // ============================================
    
    function testFuzz_CalculateFee_Valid(uint256 score) public view {
        uint24 fee = hook.calculateFee(score);
        assertTrue(fee == 15 || fee == 22 || fee == 30, "Fee must be one of: 15, 22, or 30 bp");
    }
    
    function testFuzz_FeeMonotonicity(uint256 s1, uint256 s2) public view {
        // Higher score should always have lower or equal fee
        if (s1 >= s2) {
            assertTrue(hook.calculateFee(s1) <= hook.calculateFee(s2), "Fee should be monotonic");
        }
    }
}
