// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {KindredHookV2} from "../src/KindredHookV2.sol";
import {ReputationOracle} from "../src/ReputationOracle.sol";

contract MockPoolManager {
    function getLock(uint256) external pure returns (address, address) {
        return (address(0), address(0));
    }
}

contract KindredHookV2Test is Test {
    KindredHookV2 hook;
    ReputationOracle oracle;
    MockPoolManager poolManager;
    
    address owner = address(this);
    address highRepUser = address(0x1); // Score 900
    address mediumRepUser = address(0x2); // Score 700
    address lowRepUser = address(0x3); // Score 200
    address agent = address(0x4); // AI Agent
    
    function setUp() public {
        oracle = new ReputationOracle();
        poolManager = new MockPoolManager();
        hook = new KindredHookV2(address(oracle), address(poolManager));
        
        // Set up test reputations
        oracle.setScore(highRepUser, 900);
        oracle.setScore(mediumRepUser, 700);
        oracle.setScore(lowRepUser, 200);
        oracle.setScore(agent, 350);
    }
    
    // ============================================
    // ANTI-MEV PRIORITY TESTS
    // ============================================
    
    function test_PriorityCalculation() public view {
        // High trust = Priority 3 (immediate)
        assertEq(hook.calculatePriority(900), 3);
        
        // Medium trust = Priority 2 (normal)
        assertEq(hook.calculatePriority(700), 2);
        
        // Low trust = Priority 1 (delayed for MEV protection)
        assertEq(hook.calculatePriority(200), 1);
    }
    
    function test_HighRepUserGetsImmediatePriority() public view {
        uint256 priority = hook.getPriorityForAccount(highRepUser);
        assertEq(priority, 3, "High rep should get immediate priority");
    }
    
    function test_LowRepUserGetsDelayedPriority() public view {
        uint256 priority = hook.getPriorityForAccount(lowRepUser);
        assertEq(priority, 1, "Low rep should get delayed priority for MEV protection");
    }
    
    // ============================================
    // REFERRAL SYSTEM TESTS
    // ============================================
    
    function test_SetReferrer() public {
        vm.prank(lowRepUser);
        hook.setReferrer(highRepUser);
        
        (address referrer,,) = hook.getReferralInfo(lowRepUser);
        assertEq(referrer, highRepUser);
    }
    
    function test_ReferrerMustHaveHighReputation() public {
        vm.prank(highRepUser);
        vm.expectRevert();
        hook.setReferrer(lowRepUser); // Low rep can't be referrer
    }
    
    function test_ReferralCountIncreases() public {
        vm.prank(lowRepUser);
        hook.setReferrer(highRepUser);
        
        (,uint256 count,) = hook.getReferralInfo(highRepUser);
        assertEq(count, 1);
    }
    
    function test_CannotChangeReferrer() public {
        vm.startPrank(lowRepUser);
        hook.setReferrer(highRepUser);
        hook.setReferrer(mediumRepUser); // Should be ignored
        vm.stopPrank();
        
        (address referrer,,) = hook.getReferralInfo(lowRepUser);
        assertEq(referrer, highRepUser, "Referrer should not change");
    }
    
    // ============================================
    // AI AGENT PROTECTION TESTS
    // ============================================
    
    function test_RegisterAgent() public {
        vm.prank(agent);
        hook.registerAgent(agent);
        
        assertTrue(hook.isAgent(agent));
    }
    
    function test_AgentLowerReputationRequirement() public {
        hook.registerAgent(agent);
        
        // Agent with 350 score can trade (normal minimum is 100 but agent is 300)
        assertTrue(hook.canTrade(agent));
        
        // Non-agent with 350 score can also trade (350 > 100)
        assertTrue(hook.canTrade(mediumRepUser));
    }
    
    function test_AgentGetsStartingReputation() public {
        address newAgent = address(0x5);
        oracle.setScore(newAgent, 0); // Start with 0
        
        vm.prank(newAgent);
        hook.registerAgent(newAgent);
        
        // Should have been boosted to AGENT_MIN_REPUTATION (300)
        uint256 score = oracle.getScore(newAgent);
        assertGe(score, 300, "Agent should get minimum reputation");
    }
    
    // ============================================
    // FEE CALCULATION TESTS
    // ============================================
    
    function test_HighRepUserGetsBestFee() public view {
        uint24 fee = hook.getFeeForAccount(highRepUser);
        assertEq(fee, 15, "High rep should get 0.15% fee");
    }
    
    function test_MediumRepUserGetsMediumFee() public view {
        uint24 fee = hook.getFeeForAccount(mediumRepUser);
        assertEq(fee, 22, "Medium rep should get 0.22% fee");
    }
    
    function test_LowRepUserGetsHighestFee() public view {
        uint24 fee = hook.getFeeForAccount(lowRepUser);
        assertEq(fee, 30, "Low rep should get 0.30% fee");
    }
    
    // ============================================
    // CIRCUIT BREAKER TESTS
    // ============================================
    
    function test_CircuitBreakerThresholdUpdate() public {
        hook.setCircuitBreakerThreshold(7);
        assertEq(hook.circuitBreakerThreshold(), 7);
    }
    
    function test_CircuitBreakerCannotExceedMax() public {
        vm.expectRevert("Too high");
        hook.setCircuitBreakerThreshold(15); // MAX is 10
    }
    
    // ============================================
    // ACCESS CONTROL TESTS
    // ============================================
    
    function test_OnlyOwnerCanPause() public {
        vm.prank(lowRepUser);
        vm.expectRevert();
        hook.pause();
    }
    
    function test_PauseBlocksSwaps() public {
        hook.pause();
        
        bytes memory hookData = abi.encodePacked(highRepUser);
        vm.expectRevert();
        hook.beforeSwap(highRepUser, "", hookData);
    }
}
