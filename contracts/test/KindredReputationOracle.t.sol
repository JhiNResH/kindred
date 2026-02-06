// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/KindredReputationOracle.sol";
import "../src/KindredComment.sol";
import "../src/KindToken.sol";

contract KindredReputationOracleTest is Test {
    KindredReputationOracle public oracle;
    KindredComment public commentNFT;
    KindTokenTestnet public kindToken;
    
    address public owner = address(this);
    address public treasury = address(0x999);
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);
    
    bytes32 public projectA = keccak256("ProjectA");
    
    function setUp() public {
        // Deploy contracts
        kindToken = new KindTokenTestnet();
        commentNFT = new KindredComment(address(kindToken), treasury);
        oracle = new KindredReputationOracle(address(commentNFT));
        
        // Mint tokens to test users
        kindToken.adminMint(alice, 10000e18);
        kindToken.adminMint(bob, 10000e18);
        kindToken.adminMint(charlie, 10000e18);
        
        // Approve comment contract
        vm.prank(alice);
        kindToken.approve(address(commentNFT), type(uint256).max);
        vm.prank(bob);
        kindToken.approve(address(commentNFT), type(uint256).max);
        vm.prank(charlie);
        kindToken.approve(address(commentNFT), type(uint256).max);
    }
    
    // ============================================
    // BASE SCORE TESTS
    // ============================================
    
    function test_GetScore_NoActivity() public view {
        assertEq(oracle.getScore(alice), 500, "Should return BASE_SCORE for no activity");
    }
    
    function test_GetScore_OneComment() public {
        vm.prank(alice);
        commentNFT.createComment(projectA, "Great project!", "", 0, 0);
        
        // Base 500 + 10 for comment = 510
        assertEq(oracle.getScore(alice), 510, "Should add POINTS_PER_COMMENT");
    }
    
    function test_GetScore_MultipleComments() public {
        vm.startPrank(alice);
        commentNFT.createComment(projectA, "Comment 1", "", 0, 0);
        commentNFT.createComment(projectA, "Comment 2", "", 0, 0);
        commentNFT.createComment(projectA, "Comment 3", "", 0, 0);
        vm.stopPrank();
        
        // Base 500 + (3 * 10) = 530
        assertEq(oracle.getScore(alice), 530, "Should add points for each comment");
    }
    
    // ============================================
    // UPVOTE SCORING TESTS
    // ============================================
    
    function test_GetScore_WithUpvotes() public {
        // Alice creates comment
        vm.prank(alice);
        uint256 tokenId = commentNFT.createComment(projectA, "Amazing!", "", 0, 0);
        
        // Bob upvotes with 50 tokens
        vm.prank(bob);
        commentNFT.upvote(tokenId, 50e18);
        
        // Base 500 + 10 (comment) + 50 (upvote normalized) = 560
        assertEq(oracle.getScore(alice), 560, "Should add upvote value to score");
    }
    
    function test_GetScore_MultipleUpvotes() public {
        vm.prank(alice);
        uint256 tokenId = commentNFT.createComment(projectA, "Good work", "", 0, 0);
        
        vm.prank(bob);
        commentNFT.upvote(tokenId, 100e18);
        
        vm.prank(charlie);
        commentNFT.upvote(tokenId, 50e18);
        
        // Base 500 + 10 + 100 + 50 = 660
        assertEq(oracle.getScore(alice), 660);
    }
    
    // ============================================
    // DOWNVOTE PENALTY TESTS
    // ============================================
    
    function test_GetScore_WithDownvotes() public {
        vm.prank(alice);
        uint256 tokenId = commentNFT.createComment(projectA, "Controversial take", "", 0, 0);
        
        vm.prank(bob);
        commentNFT.downvote(tokenId, 30e18);
        
        // Base 500 + 10 - 30 = 480
        assertEq(oracle.getScore(alice), 480, "Should subtract downvote value");
    }
    
    function test_GetScore_MixedVotes() public {
        vm.prank(alice);
        uint256 tokenId = commentNFT.createComment(projectA, "Debatable", "", 0, 0);
        
        vm.prank(bob);
        commentNFT.upvote(tokenId, 100e18);
        
        vm.prank(charlie);
        commentNFT.downvote(tokenId, 40e18);
        
        // Base 500 + 10 + 100 - 40 = 570
        assertEq(oracle.getScore(alice), 570);
    }
    
    // ============================================
    // PREMIUM UNLOCK BONUS TESTS
    // ============================================
    
    function test_GetScore_WithUnlocks() public {
        vm.prank(alice);
        uint256 tokenId = commentNFT.createComment(
            projectA, 
            "Public part", 
            "Premium content", 
            100e18,  // unlock price
            0
        );
        
        // Bob unlocks premium
        vm.prank(bob);
        commentNFT.unlockPremium(tokenId);
        
        // Base 500 + 10 (comment) + 5 (unlock) = 515
        assertEq(oracle.getScore(alice), 515, "Should add unlock bonus");
    }
    
    function test_GetScore_MultipleUnlocks() public {
        vm.prank(alice);
        uint256 tokenId = commentNFT.createComment(
            projectA,
            "Public",
            "Premium",
            50e18,
            0
        );
        
        vm.prank(bob);
        commentNFT.unlockPremium(tokenId);
        
        vm.prank(charlie);
        commentNFT.unlockPremium(tokenId);
        
        // Base 500 + 10 + (2 * 5) = 520
        assertEq(oracle.getScore(alice), 520);
    }
    
    // ============================================
    // SCORE BOUNDS TESTS
    // ============================================
    
    function test_GetScore_MaxScore() public {
        vm.startPrank(alice);
        // Create many comments with huge upvotes to hit max
        for (uint256 i = 0; i < 10; i++) {
            commentNFT.createComment(projectA, "Great!", "", 0, 0);
        }
        vm.stopPrank();
        
        // Upvote heavily
        vm.startPrank(bob);
        for (uint256 tokenId = 0; tokenId < 10; tokenId++) {
            commentNFT.upvote(tokenId, 100e18);
        }
        vm.stopPrank();
        
        // Should cap at MAX_SCORE (1000)
        uint256 score = oracle.getScore(alice);
        assertEq(score, 1000, "Should cap at MAX_SCORE");
    }
    
    function test_GetScore_MinScore() public {
        vm.prank(alice);
        uint256 tokenId = commentNFT.createComment(projectA, "Bad take", "", 0, 0);
        
        // Heavy downvotes
        vm.prank(bob);
        commentNFT.downvote(tokenId, 1000e18);
        
        // Should floor at 0
        uint256 score = oracle.getScore(alice);
        assertEq(score, 0, "Should floor at 0");
    }
    
    // ============================================
    // BLOCKED ACCOUNT TESTS
    // ============================================
    
    function test_IsBlocked_Default() public view {
        assertFalse(oracle.isBlocked(alice), "Should not be blocked by default");
    }
    
    function test_SetBlocked() public {
        oracle.setBlocked(alice, true);
        assertTrue(oracle.isBlocked(alice), "Should be blocked");
        assertEq(oracle.getScore(alice), 0, "Blocked users should have 0 score");
    }
    
    function test_SetBlocked_Unblock() public {
        oracle.setBlocked(alice, true);
        oracle.setBlocked(alice, false);
        
        assertFalse(oracle.isBlocked(alice));
        assertEq(oracle.getScore(alice), 500, "Should return to BASE_SCORE");
    }
    
    function test_SetBlocked_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert("Not owner");
        oracle.setBlocked(bob, true);
    }
    
    // ============================================
    // SCORE BREAKDOWN TESTS
    // ============================================
    
    function test_GetScoreBreakdown() public {
        vm.prank(alice);
        uint256 tokenId = commentNFT.createComment(projectA, "Test", "Premium", 50e18, 0);
        
        vm.prank(bob);
        commentNFT.upvote(tokenId, 100e18);
        
        vm.prank(charlie);
        commentNFT.downvote(tokenId, 20e18);
        
        vm.prank(bob);
        commentNFT.unlockPremium(tokenId);
        
        (
            uint256 baseScore,
            uint256 commentCount,
            uint256 totalUpvotes,
            uint256 totalDownvotes,
            uint256 totalUnlocks,
            uint256 finalScore
        ) = oracle.getScoreBreakdown(alice);
        
        assertEq(baseScore, 500);
        assertEq(commentCount, 1);
        assertEq(totalUpvotes, 100e18);
        assertEq(totalDownvotes, 20e18);
        assertEq(totalUnlocks, 1);
        
        // Base 500 + 10 (comment) + 100 (upvote) - 20 (downvote) + 5 (unlock) = 595
        assertEq(finalScore, 595);
    }
    
    function test_GetScoreBreakdown_Blocked() public {
        oracle.setBlocked(alice, true);
        
        (
            uint256 baseScore,
            uint256 commentCount,
            uint256 totalUpvotes,
            uint256 totalDownvotes,
            uint256 totalUnlocks,
            uint256 finalScore
        ) = oracle.getScoreBreakdown(alice);
        
        assertEq(baseScore, 0);
        assertEq(commentCount, 0);
        assertEq(finalScore, 0);
    }
    
    // ============================================
    // OWNERSHIP TESTS
    // ============================================
    
    function test_TransferOwnership() public {
        oracle.transferOwnership(alice);
        assertEq(oracle.owner(), alice);
    }
    
    function test_TransferOwnership_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert("Not owner");
        oracle.transferOwnership(bob);
    }
    
    // ============================================
    // INTEGRATION TESTS
    // ============================================
    
    function test_Integration_HighReputationUser() public {
        // Alice is a power user
        vm.startPrank(alice);
        for (uint256 i = 0; i < 5; i++) {
            commentNFT.createComment(projectA, "Quality content", "", 0, 0);
        }
        vm.stopPrank();
        
        // Gets many upvotes
        vm.startPrank(bob);
        for (uint256 tokenId = 0; tokenId < 5; tokenId++) {
            commentNFT.upvote(tokenId, 80e18);
        }
        vm.stopPrank();
        
        // Base 500 + (5*10) + (5*80) = 950
        uint256 score = oracle.getScore(alice);
        assertGe(score, 850, "Should reach high trust threshold");
    }
    
    function test_Integration_LowReputationUser() public {
        vm.prank(alice);
        uint256 tokenId = commentNFT.createComment(projectA, "Spam", "", 0, 0);
        
        // Gets downvoted heavily
        vm.prank(bob);
        commentNFT.downvote(tokenId, 200e18);
        
        // Base 500 + 10 - 200 = 310
        uint256 score = oracle.getScore(alice);
        assertLt(score, 600, "Should be in low trust tier");
    }
}
