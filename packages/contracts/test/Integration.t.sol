// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/KindredHook.sol";
import "../src/ReputationOracle.sol";

/**
 * @title IntegrationTest
 * @notice Integration tests for KindredHook + ReputationOracle working together
 * @author Patrick Collins 🛡️ | Team Kindred
 */
contract IntegrationTest is Test {
    KindredHook public hook;
    ReputationOracle public oracle;
    
    address public owner = address(this);
    address public trader1 = address(0x1);
    address public trader2 = address(0x2);
    address public trader3 = address(0x3);
    address public badActor = address(0x666);
    
    function setUp() public {
        // Deploy oracle first
        oracle = new ReputationOracle();
        
        // Deploy hook with oracle
        hook = new KindredHook(address(oracle));
        
        // Setup initial reputation scores
        oracle.setScore(trader1, 950);  // Elite
        oracle.setScore(trader2, 500);  // Normal
        oracle.setScore(trader3, 150);  // Risky but allowed
        oracle.setScore(badActor, 50);  // Below minimum
    }
    
    // ============ Integration Flow Tests ============
    
    function test_Integration_FullTradeFlow() public {
        // Trader1 (elite) should get lowest fee
        assertTrue(hook.canTrade(trader1));
        assertEq(hook.getFeeForAccount(trader1), 10); // 0.1%
        
        // Trader2 (normal) should get standard fee
        assertTrue(hook.canTrade(trader2));
        assertEq(hook.getFeeForAccount(trader2), 30); // 0.3%
        
        // Trader3 (risky) should get highest fee
        assertTrue(hook.canTrade(trader3));
        assertEq(hook.getFeeForAccount(trader3), 50); // 0.5%
        
        // Bad actor cannot trade
        assertFalse(hook.canTrade(badActor));
    }
    
    function test_Integration_ReputationUpgrade() public {
        // Start as risky trader
        address newTrader = address(0x100);
        oracle.setScore(newTrader, 200);
        
        assertEq(hook.getFeeForAccount(newTrader), 50); // Risky fee
        
        // Build reputation over time
        oracle.increaseScore(newTrader, 300); // Now 500
        assertEq(hook.getFeeForAccount(newTrader), 30); // Normal fee
        
        oracle.increaseScore(newTrader, 250); // Now 750
        assertEq(hook.getFeeForAccount(newTrader), 20); // Trusted fee
        
        oracle.increaseScore(newTrader, 200); // Now 950
        assertEq(hook.getFeeForAccount(newTrader), 10); // Elite fee
    }
    
    function test_Integration_ReputationDowngrade() public {
        // Start as elite trader
        address degradingTrader = address(0x200);
        oracle.setScore(degradingTrader, 950);
        
        assertEq(hook.getFeeForAccount(degradingTrader), 10); // Elite
        
        // Bad behavior decreases reputation
        oracle.decreaseScore(degradingTrader, 300); // Now 650
        assertEq(hook.getFeeForAccount(degradingTrader), 30); // Normal
        
        oracle.decreaseScore(degradingTrader, 400); // Now 250
        assertEq(hook.getFeeForAccount(degradingTrader), 50); // Risky
        
        oracle.decreaseScore(degradingTrader, 200); // Now 50
        assertFalse(hook.canTrade(degradingTrader)); // Blocked!
    }
    
    function test_Integration_BlockedTrader() public {
        // High score but blocked
        address blockedTrader = address(0x300);
        oracle.setScore(blockedTrader, 900);
        
        assertTrue(hook.canTrade(blockedTrader));
        
        // Admin blocks trader
        oracle.setBlocked(blockedTrader, true);
        
        assertFalse(hook.canTrade(blockedTrader));
        
        // Even with high score, cannot trade
        vm.expectRevert(abi.encodeWithSelector(
            KindredHook.AccountBlocked.selector,
            blockedTrader
        ));
        hook.validateTrade(blockedTrader);
    }
    
    function test_Integration_BatchReputationUpdate() public {
        // Batch update multiple traders
        address[] memory traders = new address[](3);
        traders[0] = address(0x400);
        traders[1] = address(0x401);
        traders[2] = address(0x402);
        
        uint256[] memory scores = new uint256[](3);
        scores[0] = 900; // Elite
        scores[1] = 700; // Trusted
        scores[2] = 400; // Normal
        
        oracle.batchSetScores(traders, scores);
        
        assertEq(hook.getFeeForAccount(traders[0]), 10);
        assertEq(hook.getFeeForAccount(traders[1]), 20);
        assertEq(hook.getFeeForAccount(traders[2]), 30);
    }
    
    function test_Integration_NewUserDefaultReputation() public {
        // New user with no score set
        address newUser = address(0x500);
        
        // Oracle returns default score (500)
        assertEq(oracle.getScore(newUser), 500);
        
        // Hook should allow trading with normal fee
        assertTrue(hook.canTrade(newUser));
        assertEq(hook.getFeeForAccount(newUser), 30); // Normal tier
    }
    
    // ============ Edge Cases ============
    
    function test_Integration_ExactThresholds() public {
        address[] memory traders = new address[](4);
        traders[0] = address(0x600);
        traders[1] = address(0x601);
        traders[2] = address(0x602);
        traders[3] = address(0x603);
        
        // Set exact threshold values
        oracle.setScore(traders[0], 900); // Exact elite
        oracle.setScore(traders[1], 700); // Exact trusted
        oracle.setScore(traders[2], 400); // Exact normal
        oracle.setScore(traders[3], 100); // Exact minimum
        
        assertEq(hook.getFeeForAccount(traders[0]), 10);
        assertEq(hook.getFeeForAccount(traders[1]), 20);
        assertEq(hook.getFeeForAccount(traders[2]), 30);
        assertEq(hook.getFeeForAccount(traders[3]), 50);
        
        // All can trade
        for (uint i = 0; i < 4; i++) {
            assertTrue(hook.canTrade(traders[i]));
        }
    }
    
    function test_Integration_JustBelowMinimum() public {
        address almostOk = address(0x700);
        oracle.setScore(almostOk, 99); // Just below 100
        
        assertFalse(hook.canTrade(almostOk));
        
        // Increase by 1, now can trade
        oracle.increaseScore(almostOk, 1); // Now 100
        assertTrue(hook.canTrade(almostOk));
    }
    
    // ============ Fuzz Integration Tests ============
    
    function testFuzz_Integration_ConsistentFeeCalculation(uint256 score) public {
        score = bound(score, 100, 1000); // Valid trading range
        
        address fuzzTrader = address(uint160(score + 1000));
        oracle.setScore(fuzzTrader, score);
        
        // Should always be able to trade
        assertTrue(hook.canTrade(fuzzTrader));
        
        // Fee should match tier
        uint24 fee = hook.getFeeForAccount(fuzzTrader);
        if (score >= 900) {
            assertEq(fee, 10);
        } else if (score >= 700) {
            assertEq(fee, 20);
        } else if (score >= 400) {
            assertEq(fee, 30);
        } else {
            assertEq(fee, 50);
        }
    }
    
    function testFuzz_Integration_BlockedOverridesScore(uint256 score) public {
        score = bound(score, 0, 1000);
        
        address fuzzTrader = address(uint160(score + 2000));
        oracle.setScore(fuzzTrader, score);
        oracle.setBlocked(fuzzTrader, true);
        
        // Blocked users can never trade regardless of score
        assertFalse(hook.canTrade(fuzzTrader));
    }
}
