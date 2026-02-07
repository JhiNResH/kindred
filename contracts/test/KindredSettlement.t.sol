// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/KindredSettlement.sol";
import "../src/KindToken.sol";

/**
 * @title KindredSettlement Test Suite
 * @notice Comprehensive tests for the weekly settlement system
 * @author Jensen Huang 🐺 | Team Kindred
 */
contract KindredSettlementTest is Test {
    KindredSettlement public settlement;
    KindToken public kindToken;
    
    address public owner = address(this);
    address public treasury = address(0x5afe);
    address public alice = address(0xa11ce);
    address public bob = address(0xb0b);
    address public carol = address(0xca201);
    
    bytes32 public projectA = keccak256("ProjectA");
    bytes32 public projectB = keccak256("ProjectB");
    bytes32 public projectC = keccak256("ProjectC");
    bytes32 public projectD = keccak256("ProjectD");
    bytes32 public projectE = keccak256("ProjectE");
    
    uint256 public constant STAKE_AMOUNT = 100 * 1e18;
    
    event RoundStarted(uint256 indexed roundId, uint256 startTime, uint256 endTime);
    event PredictionMade(
        uint256 indexed roundId,
        address indexed predictor,
        bytes32 indexed projectId,
        uint256 predictedRank,
        uint256 stakeAmount,
        bool isEarlyBird
    );
    event RoundSettled(
        uint256 indexed roundId,
        uint256 totalStaked,
        uint256 totalRewards,
        uint256 winnerCount
    );
    event RewardsClaimed(
        uint256 indexed roundId,
        address indexed predictor,
        uint256 amount
    );
    
    function setUp() public {
        // Deploy KindToken (with owner as initial holder)
        kindToken = new KindToken(owner);
        
        // Deploy Settlement
        settlement = new KindredSettlement(address(kindToken), treasury);
        
        // Mint tokens to users
        kindToken.transfer(alice, 10000 * 1e18);
        kindToken.transfer(bob, 10000 * 1e18);
        kindToken.transfer(carol, 10000 * 1e18);
        
        // Approve settlement contract
        vm.prank(alice);
        kindToken.approve(address(settlement), type(uint256).max);
        
        vm.prank(bob);
        kindToken.approve(address(settlement), type(uint256).max);
        
        vm.prank(carol);
        kindToken.approve(address(settlement), type(uint256).max);
        
        // Owner approves for funding
        kindToken.approve(address(settlement), type(uint256).max);
    }
    
    // ============ Round Management Tests ============
    
    function test_StartRound() public {
        vm.expectEmit(true, false, false, true);
        emit RoundStarted(1, block.timestamp, block.timestamp + 7 days);
        
        uint256 roundId = settlement.startRound();
        
        assertEq(roundId, 1);
        assertEq(settlement.currentRound(), 1);
        
        (
            uint256 id,
            uint256 startTime,
            uint256 endTime,
            uint256 totalStaked,
            uint256 totalRewards,
            bool isActive,
            bool isSettled
        ) = settlement.getCurrentRound();
        
        assertEq(id, 1);
        assertEq(startTime, block.timestamp);
        assertEq(endTime, block.timestamp + 7 days);
        assertEq(totalStaked, 0);
        assertEq(totalRewards, 0);
        assertTrue(isActive);
        assertFalse(isSettled);
    }
    
    function test_StartRound_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        settlement.startRound();
    }
    
    function test_FundRound() public {
        settlement.startRound();
        
        uint256 fundAmount = 1000 * 1e18;
        settlement.fundRound(fundAmount);
        
        (,,,,uint256 totalRewards,,) = settlement.getCurrentRound();
        assertEq(totalRewards, fundAmount);
    }
    
    function test_FundRound_ZeroAmount() public {
        settlement.startRound();
        
        vm.expectRevert(KindredSettlement.ZeroAmount.selector);
        settlement.fundRound(0);
    }
    
    // ============ Prediction Tests ============
    
    function test_Predict() public {
        settlement.startRound();
        
        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit PredictionMade(1, alice, projectA, 1, STAKE_AMOUNT, true);
        
        settlement.predict(projectA, 1, STAKE_AMOUNT);
        
        (,,,uint256 totalStaked,,,) = settlement.getCurrentRound();
        assertEq(totalStaked, STAKE_AMOUNT);
        
        KindredSettlement.Prediction[] memory preds = settlement.getUserPredictions(1, alice);
        assertEq(preds.length, 1);
        assertEq(preds[0].projectId, projectA);
        assertEq(preds[0].predictedRank, 1);
        assertEq(preds[0].stakeAmount, STAKE_AMOUNT);
        assertTrue(preds[0].isEarlyBird);
    }
    
    function test_Predict_MultiplePredictions() public {
        settlement.startRound();
        
        vm.startPrank(alice);
        settlement.predict(projectA, 1, STAKE_AMOUNT);
        settlement.predict(projectB, 2, STAKE_AMOUNT);
        settlement.predict(projectC, 3, STAKE_AMOUNT);
        vm.stopPrank();
        
        KindredSettlement.Prediction[] memory preds = settlement.getUserPredictions(1, alice);
        assertEq(preds.length, 3);
    }
    
    function test_Predict_DuplicateProject() public {
        settlement.startRound();
        
        vm.startPrank(alice);
        settlement.predict(projectA, 1, STAKE_AMOUNT);
        
        vm.expectRevert(KindredSettlement.AlreadyPredicted.selector);
        settlement.predict(projectA, 2, STAKE_AMOUNT);
        vm.stopPrank();
    }
    
    function test_Predict_InvalidRank_Zero() public {
        settlement.startRound();
        
        vm.prank(alice);
        vm.expectRevert(KindredSettlement.InvalidPrediction.selector);
        settlement.predict(projectA, 0, STAKE_AMOUNT);
    }
    
    function test_Predict_InvalidRank_TooHigh() public {
        settlement.startRound();
        
        vm.prank(alice);
        vm.expectRevert(KindredSettlement.InvalidPrediction.selector);
        settlement.predict(projectA, 11, STAKE_AMOUNT);
    }
    
    function test_Predict_InvalidProject() public {
        settlement.startRound();
        
        vm.prank(alice);
        vm.expectRevert(KindredSettlement.InvalidProject.selector);
        settlement.predict(bytes32(0), 1, STAKE_AMOUNT);
    }
    
    function test_Predict_ZeroAmount() public {
        settlement.startRound();
        
        vm.prank(alice);
        vm.expectRevert(KindredSettlement.ZeroAmount.selector);
        settlement.predict(projectA, 1, 0);
    }
    
    function test_Predict_RoundNotActive() public {
        vm.prank(alice);
        vm.expectRevert(KindredSettlement.RoundNotActive.selector);
        settlement.predict(projectA, 1, STAKE_AMOUNT);
    }
    
    function test_Predict_RoundEnded() public {
        settlement.startRound();
        
        // Fast forward past round end
        vm.warp(block.timestamp + 8 days);
        
        vm.prank(alice);
        vm.expectRevert(KindredSettlement.RoundNotActive.selector);
        settlement.predict(projectA, 1, STAKE_AMOUNT);
    }
    
    function test_Predict_EarlyBird() public {
        settlement.startRound();
        
        // Within 24h - should be early bird
        vm.prank(alice);
        settlement.predict(projectA, 1, STAKE_AMOUNT);
        
        KindredSettlement.Prediction[] memory preds = settlement.getUserPredictions(1, alice);
        assertTrue(preds[0].isEarlyBird);
        
        // After 24h - should NOT be early bird
        vm.warp(block.timestamp + 25 hours);
        
        vm.prank(bob);
        settlement.predict(projectA, 1, STAKE_AMOUNT);
        
        preds = settlement.getUserPredictions(1, bob);
        assertFalse(preds[0].isEarlyBird);
    }
    
    // ============ Settlement Tests ============
    
    function test_SetRankings() public {
        settlement.startRound();
        
        // Make predictions
        vm.prank(alice);
        settlement.predict(projectA, 1, STAKE_AMOUNT);
        
        // Fast forward past round end
        vm.warp(block.timestamp + 8 days);
        
        // Set rankings
        bytes32[] memory rankings = new bytes32[](3);
        rankings[0] = projectA;  // Rank 1
        rankings[1] = projectB;  // Rank 2
        rankings[2] = projectC;  // Rank 3
        
        settlement.setRankings(1, rankings);
        
        bytes32[] memory rankedProjects = settlement.getRankedProjects(1);
        assertEq(rankedProjects.length, 3);
        assertEq(rankedProjects[0], projectA);
    }
    
    function test_SetRankings_BeforeRoundEnds() public {
        settlement.startRound();
        
        bytes32[] memory rankings = new bytes32[](1);
        rankings[0] = projectA;
        
        vm.expectRevert(KindredSettlement.RoundNotEnded.selector);
        settlement.setRankings(1, rankings);
    }
    
    function test_Settle() public {
        settlement.startRound();
        settlement.fundRound(1000 * 1e18);
        
        // Make predictions
        vm.prank(alice);
        settlement.predict(projectA, 1, STAKE_AMOUNT);
        
        vm.prank(bob);
        settlement.predict(projectB, 2, STAKE_AMOUNT);
        
        // Fast forward past round end
        vm.warp(block.timestamp + 8 days);
        
        // Set rankings
        bytes32[] memory rankings = new bytes32[](3);
        rankings[0] = projectA;
        rankings[1] = projectB;
        rankings[2] = projectC;
        settlement.setRankings(1, rankings);
        
        // Settle
        vm.expectEmit(true, false, false, false);
        emit RoundSettled(1, 200 * 1e18, 0, 0);
        
        settlement.settle(1);
        
        (,,,,, bool isActive, bool isSettled) = settlement.getCurrentRound();
        assertFalse(isActive);
        assertTrue(isSettled);
        
        // Treasury should have received protocol fee
        uint256 treasuryBalance = kindToken.balanceOf(treasury);
        assertGt(treasuryBalance, 0);
    }
    
    function test_Settle_NoRankings() public {
        settlement.startRound();
        
        vm.prank(alice);
        settlement.predict(projectA, 1, STAKE_AMOUNT);
        
        vm.warp(block.timestamp + 8 days);
        
        vm.expectRevert(KindredSettlement.ProjectNotRanked.selector);
        settlement.settle(1);
    }
    
    function test_Settle_AlreadySettled() public {
        settlement.startRound();
        
        vm.prank(alice);
        settlement.predict(projectA, 1, STAKE_AMOUNT);
        
        vm.warp(block.timestamp + 8 days);
        
        bytes32[] memory rankings = new bytes32[](1);
        rankings[0] = projectA;
        settlement.setRankings(1, rankings);
        settlement.settle(1);
        
        vm.expectRevert(KindredSettlement.RoundAlreadySettled.selector);
        settlement.settle(1);
    }
    
    // ============ Claim Tests ============
    
    function test_Claim() public {
        // Setup: Start round, fund it, make predictions
        settlement.startRound();
        settlement.fundRound(1000 * 1e18);
        
        vm.prank(alice);
        settlement.predict(projectA, 1, STAKE_AMOUNT);
        
        // End round and settle
        vm.warp(block.timestamp + 8 days);
        
        bytes32[] memory rankings = new bytes32[](1);
        rankings[0] = projectA;
        settlement.setRankings(1, rankings);
        settlement.settle(1);
        
        // Preview and claim
        uint256 previewAmount = settlement.previewReward(1, alice);
        assertGt(previewAmount, 0);
        
        uint256 balanceBefore = kindToken.balanceOf(alice);
        
        vm.prank(alice);
        settlement.claim(1);
        
        uint256 balanceAfter = kindToken.balanceOf(alice);
        assertGt(balanceAfter, balanceBefore);
    }
    
    function test_Claim_NotSettled() public {
        settlement.startRound();
        
        vm.prank(alice);
        settlement.predict(projectA, 1, STAKE_AMOUNT);
        
        vm.prank(alice);
        vm.expectRevert(KindredSettlement.RoundNotSettled.selector);
        settlement.claim(1);
    }
    
    function test_Claim_NoPredictions() public {
        settlement.startRound();
        
        vm.prank(alice);
        settlement.predict(projectA, 1, STAKE_AMOUNT);
        
        vm.warp(block.timestamp + 8 days);
        
        bytes32[] memory rankings = new bytes32[](1);
        rankings[0] = projectA;
        settlement.setRankings(1, rankings);
        settlement.settle(1);
        
        // Bob didn't predict
        vm.prank(bob);
        vm.expectRevert(KindredSettlement.NothingToClaim.selector);
        settlement.claim(1);
    }
    
    // ============ View Function Tests ============
    
    function test_TimeRemaining() public {
        settlement.startRound();
        
        uint256 remaining = settlement.timeRemaining();
        assertEq(remaining, 7 days);
        
        vm.warp(block.timestamp + 3 days);
        
        remaining = settlement.timeRemaining();
        assertEq(remaining, 4 days);
        
        vm.warp(block.timestamp + 5 days);
        
        remaining = settlement.timeRemaining();
        assertEq(remaining, 0);
    }
    
    function test_IsPredictionCorrect() public {
        settlement.startRound();
        
        vm.prank(alice);
        settlement.predict(projectA, 1, STAKE_AMOUNT);  // Predict rank 1
        
        vm.prank(bob);
        settlement.predict(projectA, 2, STAKE_AMOUNT);  // Predict rank 2
        
        vm.prank(carol);
        settlement.predict(projectA, 5, STAKE_AMOUNT);  // Predict rank 5
        
        vm.warp(block.timestamp + 8 days);
        
        bytes32[] memory rankings = new bytes32[](5);
        rankings[0] = projectA;  // Actual rank 1
        rankings[1] = projectB;
        rankings[2] = projectC;
        rankings[3] = projectD;
        rankings[4] = projectE;
        settlement.setRankings(1, rankings);
        
        // Alice: exact match
        (bool exact, bool close, bool inTop) = settlement.isPredictionCorrect(1, alice, 0);
        assertTrue(exact);
        assertTrue(close);
        assertTrue(inTop);
        
        // Bob: off by 1
        (exact, close, inTop) = settlement.isPredictionCorrect(1, bob, 0);
        assertFalse(exact);
        assertTrue(close);
        assertTrue(inTop);
        
        // Carol: off by 4
        (exact, close, inTop) = settlement.isPredictionCorrect(1, carol, 0);
        assertFalse(exact);
        assertFalse(close);
        assertTrue(inTop);
    }
    
    // ============ Admin Function Tests ============
    
    function test_SetSettler() public {
        address newSettler = address(0x123);
        
        settlement.setSettler(newSettler, true);
        assertTrue(settlement.settlers(newSettler));
        
        settlement.setSettler(newSettler, false);
        assertFalse(settlement.settlers(newSettler));
    }
    
    function test_SetSettler_ZeroAddress() public {
        vm.expectRevert(KindredSettlement.ZeroAddress.selector);
        settlement.setSettler(address(0), true);
    }
    
    function test_SetTreasury() public {
        address newTreasury = address(0x456);
        
        settlement.setTreasury(newTreasury);
        assertEq(settlement.treasury(), newTreasury);
    }
    
    function test_SetTreasury_ZeroAddress() public {
        vm.expectRevert(KindredSettlement.ZeroAddress.selector);
        settlement.setTreasury(address(0));
    }
    
    function test_EmergencyWithdraw() public {
        settlement.startRound();
        
        vm.prank(alice);
        settlement.predict(projectA, 1, STAKE_AMOUNT);
        
        uint256 treasuryBefore = kindToken.balanceOf(treasury);
        
        settlement.emergencyWithdraw(address(kindToken), STAKE_AMOUNT);
        
        uint256 treasuryAfter = kindToken.balanceOf(treasury);
        assertEq(treasuryAfter - treasuryBefore, STAKE_AMOUNT);
    }
    
    // ============ Integration Tests ============
    
    function test_FullRoundFlow() public {
        // 1. Start round
        settlement.startRound();
        
        // 2. Fund round
        settlement.fundRound(500 * 1e18);
        
        // 3. Users make predictions
        vm.prank(alice);
        settlement.predict(projectA, 1, 200 * 1e18);  // Predicts A at #1
        
        vm.prank(bob);
        settlement.predict(projectA, 3, 150 * 1e18);  // Predicts A at #3
        
        vm.prank(carol);
        settlement.predict(projectB, 1, 100 * 1e18);  // Predicts B at #1
        
        // Late prediction (not early bird)
        vm.warp(block.timestamp + 2 days);
        
        vm.prank(alice);
        settlement.predict(projectB, 2, 50 * 1e18);   // Predicts B at #2
        
        // 4. Round ends
        vm.warp(block.timestamp + 6 days);
        
        // 5. Set final rankings: A=#1, B=#2, C=#3
        bytes32[] memory rankings = new bytes32[](3);
        rankings[0] = projectA;  // Rank 1
        rankings[1] = projectB;  // Rank 2
        rankings[2] = projectC;  // Rank 3
        settlement.setRankings(1, rankings);
        
        // 6. Settle round
        uint256 treasuryBefore = kindToken.balanceOf(treasury);
        settlement.settle(1);
        uint256 treasuryAfter = kindToken.balanceOf(treasury);
        
        // Protocol got its 20%
        assertGt(treasuryAfter, treasuryBefore);
        
        // 7. Users claim rewards
        uint256 alicePreview = settlement.previewReward(1, alice);
        uint256 bobPreview = settlement.previewReward(1, bob);
        uint256 carolPreview = settlement.previewReward(1, carol);
        
        // Alice should get most (exact match on A, close match on B)
        assertGt(alicePreview, bobPreview);
        
        // All can claim
        vm.prank(alice);
        settlement.claim(1);
        
        vm.prank(bob);
        settlement.claim(1);
        
        vm.prank(carol);
        settlement.claim(1);
        
        // Verify claims worked
        assertEq(settlement.totalDistributedRewards(), alicePreview + bobPreview + carolPreview);
    }
    
    function test_MultipleRounds() public {
        // Round 1
        settlement.startRound();
        vm.prank(alice);
        settlement.predict(projectA, 1, STAKE_AMOUNT);
        
        vm.warp(block.timestamp + 8 days);
        
        bytes32[] memory rankings = new bytes32[](1);
        rankings[0] = projectA;
        settlement.setRankings(1, rankings);
        settlement.settle(1);
        
        // Round 2
        settlement.startRound();
        assertEq(settlement.currentRound(), 2);
        
        vm.prank(bob);
        settlement.predict(projectB, 1, STAKE_AMOUNT);
        
        vm.warp(block.timestamp + 8 days);
        
        rankings[0] = projectB;
        settlement.setRankings(2, rankings);
        settlement.settle(2);
        
        assertEq(settlement.totalSettledRounds(), 2);
    }
}
