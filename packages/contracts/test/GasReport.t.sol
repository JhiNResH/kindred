// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/KindredHook.sol";
import "../src/ReputationOracle.sol";

/**
 * @title GasReportTest
 * @notice Gas benchmarking for Kindred protocol operations
 * @dev Run with: forge test --match-contract GasReportTest --gas-report
 * @author Patrick Collins 🛡️ | Team Kindred
 */
contract GasReportTest is Test {
    KindredHook public hook;
    ReputationOracle public oracle;
    
    address public user = address(0x1);
    
    function setUp() public {
        oracle = new ReputationOracle();
        hook = new KindredHook(address(oracle));
        oracle.setScore(user, 500);
    }
    
    // ============ ReputationOracle Gas Tests ============
    
    function test_Gas_Oracle_SetScore() public {
        oracle.setScore(address(0x100), 750);
    }
    
    function test_Gas_Oracle_GetScore() public view {
        oracle.getScore(user);
    }
    
    function test_Gas_Oracle_IncreaseScore() public {
        oracle.increaseScore(user, 100);
    }
    
    function test_Gas_Oracle_DecreaseScore() public {
        oracle.decreaseScore(user, 100);
    }
    
    function test_Gas_Oracle_SetBlocked() public {
        oracle.setBlocked(user, true);
    }
    
    function test_Gas_Oracle_BatchSetScores_5() public {
        address[] memory users = new address[](5);
        uint256[] memory scores = new uint256[](5);
        for (uint i = 0; i < 5; i++) {
            users[i] = address(uint160(0x200 + i));
            scores[i] = 500 + i * 100;
        }
        oracle.batchSetScores(users, scores);
    }
    
    function test_Gas_Oracle_BatchSetScores_10() public {
        address[] memory users = new address[](10);
        uint256[] memory scores = new uint256[](10);
        for (uint i = 0; i < 10; i++) {
            users[i] = address(uint160(0x300 + i));
            scores[i] = 500 + i * 50;
        }
        oracle.batchSetScores(users, scores);
    }
    
    function test_Gas_Oracle_BatchSetScores_20() public {
        address[] memory users = new address[](20);
        uint256[] memory scores = new uint256[](20);
        for (uint i = 0; i < 20; i++) {
            users[i] = address(uint160(0x400 + i));
            scores[i] = 100 + i * 45;
        }
        oracle.batchSetScores(users, scores);
    }
    
    // ============ KindredHook Gas Tests ============
    
    function test_Gas_Hook_CalculateFee() public view {
        hook.calculateFee(500);
    }
    
    function test_Gas_Hook_GetFeeForAccount() public view {
        hook.getFeeForAccount(user);
    }
    
    function test_Gas_Hook_CanTrade() public view {
        hook.canTrade(user);
    }
    
    function test_Gas_Hook_ValidateTrade() public view {
        hook.validateTrade(user);
    }
    
    // ============ Combined Operations ============
    
    function test_Gas_FullFlow_NewUser() public {
        address newUser = address(0x500);
        
        // 1. Set initial score
        oracle.setScore(newUser, 300);
        
        // 2. Check if can trade
        hook.canTrade(newUser);
        
        // 3. Get fee
        hook.getFeeForAccount(newUser);
        
        // 4. Validate trade
        hook.validateTrade(newUser);
    }
    
    function test_Gas_FullFlow_ReputationJourney() public {
        address trader = address(0x600);
        
        // Start as newcomer
        oracle.setScore(trader, 200);
        hook.getFeeForAccount(trader); // 50 bp (risky)
        
        // Build reputation
        oracle.increaseScore(trader, 250); // Now 450
        hook.getFeeForAccount(trader); // 30 bp (normal)
        
        oracle.increaseScore(trader, 300); // Now 750
        hook.getFeeForAccount(trader); // 20 bp (trusted)
        
        oracle.increaseScore(trader, 200); // Now 950
        hook.getFeeForAccount(trader); // 10 bp (elite)
    }
}
