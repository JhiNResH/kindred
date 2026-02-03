// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/KindredComment.sol";
import "../src/KindToken.sol";

/**
 * @title KindredCommentTest
 * @notice Comprehensive tests for KindredComment NFT system
 * @author Patrick Collins 🛡️ | Team Kindred
 */
contract KindredCommentTest is Test {
    KindredComment public comments;
    KindTokenTestnet public token;
    
    address public treasury = makeAddr("treasury");
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");
    
    bytes32 public constant PROJECT_ID = keccak256("hyperliquid");
    string public constant CONTENT_HASH = "QmTestContent123";
    string public constant PREMIUM_HASH = "QmPremiumContent456";
    
    function setUp() public {
        // Deploy token
        token = new KindTokenTestnet();
        
        // Deploy comments contract
        comments = new KindredComment(address(token), treasury);
        
        // Fund test users
        token.adminMint(alice, 100_000 * 1e18);
        token.adminMint(bob, 100_000 * 1e18);
        token.adminMint(charlie, 100_000 * 1e18);
        
        // Approve comments contract
        vm.prank(alice);
        token.approve(address(comments), type(uint256).max);
        
        vm.prank(bob);
        token.approve(address(comments), type(uint256).max);
        
        vm.prank(charlie);
        token.approve(address(comments), type(uint256).max);
    }
    
    // ============ Create Comment Tests ============
    
    function test_CreateComment_Success() public {
        vm.prank(alice);
        uint256 tokenId = comments.createComment(
            PROJECT_ID,
            CONTENT_HASH,
            "",
            0,
            0
        );
        
        assertEq(tokenId, 0);
        assertEq(comments.ownerOf(tokenId), alice);
        assertEq(comments.totalComments(), 1);
        
        KindredComment.Comment memory comment = comments.getComment(tokenId);
        assertEq(comment.author, alice);
        assertEq(comment.projectId, PROJECT_ID);
        assertEq(comment.contentHash, CONTENT_HASH);
        assertEq(comment.stakeAmount, comments.MIN_STAKE());
    }
    
    function test_CreateComment_WithPremium() public {
        uint256 unlockPrice = 50 * 1e18;
        
        vm.prank(alice);
        uint256 tokenId = comments.createComment(
            PROJECT_ID,
            CONTENT_HASH,
            PREMIUM_HASH,
            unlockPrice,
            0
        );
        
        KindredComment.Comment memory comment = comments.getComment(tokenId);
        assertEq(comment.premiumHash, PREMIUM_HASH);
        assertEq(comment.unlockPrice, unlockPrice);
        assertTrue(comment.isPremium);
    }
    
    function test_CreateComment_WithExtraStake() public {
        uint256 extraStake = 500 * 1e18;
        uint256 aliceBalanceBefore = token.balanceOf(alice);
        
        vm.prank(alice);
        comments.createComment(
            PROJECT_ID,
            CONTENT_HASH,
            "",
            0,
            extraStake
        );
        
        uint256 expectedStake = comments.MIN_STAKE() + extraStake;
        assertEq(token.balanceOf(alice), aliceBalanceBefore - expectedStake);
        assertEq(comments.totalStaked(), expectedStake);
    }
    
    function test_CreateComment_RevertInvalidContent() public {
        vm.prank(alice);
        vm.expectRevert(KindredComment.InvalidContent.selector);
        comments.createComment(PROJECT_ID, "", "", 0, 0);
    }
    
    // ============ Upvote Tests ============
    
    function test_Upvote_Success() public {
        // Create comment
        vm.prank(alice);
        uint256 tokenId = comments.createComment(PROJECT_ID, CONTENT_HASH, "", 0, 0);
        
        // Bob upvotes
        uint256 voteAmount = 100 * 1e18;
        vm.prank(bob);
        comments.upvote(tokenId, voteAmount);
        
        KindredComment.Comment memory comment = comments.getComment(tokenId);
        assertEq(comment.upvoteValue, voteAmount);
        assertEq(comments.getVoterCount(tokenId), 1);
        
        KindredComment.Vote memory vote = comments.getVote(tokenId, bob);
        assertTrue(vote.isUpvote);
        assertEq(vote.amount, voteAmount);
    }
    
    function test_Upvote_MultipleVoters() public {
        vm.prank(alice);
        uint256 tokenId = comments.createComment(PROJECT_ID, CONTENT_HASH, "", 0, 0);
        
        vm.prank(bob);
        comments.upvote(tokenId, 100 * 1e18);
        
        vm.prank(charlie);
        comments.upvote(tokenId, 200 * 1e18);
        
        KindredComment.Comment memory comment = comments.getComment(tokenId);
        assertEq(comment.upvoteValue, 300 * 1e18);
        assertEq(comments.getVoterCount(tokenId), 2);
    }
    
    function test_Upvote_RevertCommentNotFound() public {
        vm.prank(bob);
        vm.expectRevert(KindredComment.CommentNotFound.selector);
        comments.upvote(999, 100 * 1e18);
    }
    
    // ============ Downvote Tests ============
    
    function test_Downvote_Success() public {
        vm.prank(alice);
        uint256 tokenId = comments.createComment(PROJECT_ID, CONTENT_HASH, "", 0, 0);
        
        uint256 voteAmount = 50 * 1e18;
        vm.prank(bob);
        comments.downvote(tokenId, voteAmount);
        
        KindredComment.Comment memory comment = comments.getComment(tokenId);
        assertEq(comment.downvoteValue, voteAmount);
        
        int256 netScore = comments.getNetScore(tokenId);
        assertEq(netScore, -int256(voteAmount));
    }
    
    // ============ Net Score Tests ============
    
    function test_GetNetScore_Positive() public {
        vm.prank(alice);
        uint256 tokenId = comments.createComment(PROJECT_ID, CONTENT_HASH, "", 0, 0);
        
        vm.prank(bob);
        comments.upvote(tokenId, 100 * 1e18);
        
        vm.prank(charlie);
        comments.downvote(tokenId, 30 * 1e18);
        
        int256 netScore = comments.getNetScore(tokenId);
        assertEq(netScore, 70 * 1e18);
    }
    
    function test_GetNetScore_Negative() public {
        vm.prank(alice);
        uint256 tokenId = comments.createComment(PROJECT_ID, CONTENT_HASH, "", 0, 0);
        
        vm.prank(bob);
        comments.downvote(tokenId, 100 * 1e18);
        
        vm.prank(charlie);
        comments.upvote(tokenId, 30 * 1e18);
        
        int256 netScore = comments.getNetScore(tokenId);
        assertEq(netScore, -70 * 1e18);
    }
    
    // ============ Premium Unlock Tests ============
    
    function test_UnlockPremium_Success() public {
        uint256 unlockPrice = 50 * 1e18;
        
        // Create premium comment
        vm.prank(alice);
        uint256 tokenId = comments.createComment(
            PROJECT_ID,
            CONTENT_HASH,
            PREMIUM_HASH,
            unlockPrice,
            0
        );
        
        // Bob unlocks
        uint256 bobBalanceBefore = token.balanceOf(bob);
        uint256 aliceBalanceBefore = token.balanceOf(alice);
        uint256 treasuryBalanceBefore = token.balanceOf(treasury);
        
        vm.prank(bob);
        comments.unlockPremium(tokenId);
        
        // Check Bob paid
        assertEq(token.balanceOf(bob), bobBalanceBefore - unlockPrice);
        
        // Check Alice received 70%
        uint256 authorReward = (unlockPrice * 7000) / 10000;
        assertEq(token.balanceOf(alice), aliceBalanceBefore + authorReward);
        
        // Check treasury received 10% (no voters, so voter share also goes to treasury)
        uint256 voterReward = (unlockPrice * 2000) / 10000;
        uint256 protocolFee = unlockPrice - authorReward - voterReward;
        assertEq(token.balanceOf(treasury), treasuryBalanceBefore + protocolFee + voterReward);
        
        // Check unlock status
        assertTrue(comments.canAccessPremium(tokenId, bob));
    }
    
    function test_UnlockPremium_WithUpvoters() public {
        uint256 unlockPrice = 100 * 1e18;
        
        // Create premium comment
        vm.prank(alice);
        uint256 tokenId = comments.createComment(
            PROJECT_ID,
            CONTENT_HASH,
            PREMIUM_HASH,
            unlockPrice,
            0
        );
        
        // Bob upvotes (early supporter)
        vm.prank(bob);
        comments.upvote(tokenId, 100 * 1e18);
        
        uint256 bobBalanceBefore = token.balanceOf(bob);
        
        // Charlie unlocks
        vm.prank(charlie);
        comments.unlockPremium(tokenId);
        
        // Bob should receive 20% of unlock price as early voter
        uint256 voterReward = (unlockPrice * 2000) / 10000;
        assertEq(token.balanceOf(bob), bobBalanceBefore + voterReward);
    }
    
    function test_UnlockPremium_RevertAlreadyUnlocked() public {
        uint256 unlockPrice = 50 * 1e18;
        
        vm.prank(alice);
        uint256 tokenId = comments.createComment(
            PROJECT_ID,
            CONTENT_HASH,
            PREMIUM_HASH,
            unlockPrice,
            0
        );
        
        vm.prank(bob);
        comments.unlockPremium(tokenId);
        
        vm.prank(bob);
        vm.expectRevert(KindredComment.AlreadyUnlocked.selector);
        comments.unlockPremium(tokenId);
    }
    
    function test_UnlockPremium_RevertNotPremium() public {
        vm.prank(alice);
        uint256 tokenId = comments.createComment(PROJECT_ID, CONTENT_HASH, "", 0, 0);
        
        vm.prank(bob);
        vm.expectRevert(KindredComment.InvalidContent.selector);
        comments.unlockPremium(tokenId);
    }
    
    // ============ Access Control Tests ============
    
    function test_CanAccessPremium_Author() public {
        vm.prank(alice);
        uint256 tokenId = comments.createComment(
            PROJECT_ID,
            CONTENT_HASH,
            PREMIUM_HASH,
            50 * 1e18,
            0
        );
        
        assertTrue(comments.canAccessPremium(tokenId, alice));
        assertFalse(comments.canAccessPremium(tokenId, bob));
    }
    
    function test_CanAccessPremium_NFTOwner() public {
        vm.prank(alice);
        uint256 tokenId = comments.createComment(
            PROJECT_ID,
            CONTENT_HASH,
            PREMIUM_HASH,
            50 * 1e18,
            0
        );
        
        // Transfer NFT to Bob
        vm.prank(alice);
        comments.transferFrom(alice, bob, tokenId);
        
        assertTrue(comments.canAccessPremium(tokenId, bob));
    }
    
    // ============ View Function Tests ============
    
    function test_GetProjectComments() public {
        vm.prank(alice);
        comments.createComment(PROJECT_ID, CONTENT_HASH, "", 0, 0);
        
        vm.prank(bob);
        comments.createComment(PROJECT_ID, "QmOther", "", 0, 0);
        
        uint256[] memory projectCommentIds = comments.getProjectComments(PROJECT_ID);
        assertEq(projectCommentIds.length, 2);
        assertEq(projectCommentIds[0], 0);
        assertEq(projectCommentIds[1], 1);
    }
    
    function test_GetUserComments() public {
        vm.startPrank(alice);
        comments.createComment(PROJECT_ID, CONTENT_HASH, "", 0, 0);
        comments.createComment(keccak256("aave"), "QmAave", "", 0, 0);
        vm.stopPrank();
        
        uint256[] memory userCommentIds = comments.getUserComments(alice);
        assertEq(userCommentIds.length, 2);
    }
    
    // ============ Fuzz Tests ============
    
    function testFuzz_CreateComment_StakeAmount(uint256 extraStake) public {
        extraStake = bound(extraStake, 0, 10_000 * 1e18);
        
        uint256 expectedStake = comments.MIN_STAKE() + extraStake;
        
        vm.prank(alice);
        uint256 tokenId = comments.createComment(PROJECT_ID, CONTENT_HASH, "", 0, extraStake);
        
        KindredComment.Comment memory comment = comments.getComment(tokenId);
        assertEq(comment.stakeAmount, expectedStake);
    }
    
    function testFuzz_Upvote_Amount(uint256 amount) public {
        amount = bound(amount, 1, 50_000 * 1e18);
        
        vm.prank(alice);
        uint256 tokenId = comments.createComment(PROJECT_ID, CONTENT_HASH, "", 0, 0);
        
        vm.prank(bob);
        comments.upvote(tokenId, amount);
        
        KindredComment.Comment memory comment = comments.getComment(tokenId);
        assertEq(comment.upvoteValue, amount);
    }
}
