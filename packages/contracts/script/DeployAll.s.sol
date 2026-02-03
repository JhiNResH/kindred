// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/KindredHook.sol";
import "../src/ReputationOracle.sol";

/**
 * @title DeployAll
 * @notice Deploy all Kindred protocol contracts
 * @dev Run: forge script script/DeployAll.s.sol --rpc-url base --broadcast
 * @author Patrick Collins 🛡️ | Team Kindred
 */
contract DeployAll is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy ReputationOracle first
        ReputationOracle oracle = new ReputationOracle();
        console.log("ReputationOracle deployed at:", address(oracle));
        
        // 2. Deploy KindredHook with oracle address
        KindredHook hook = new KindredHook(address(oracle));
        console.log("KindredHook deployed at:", address(hook));
        
        // 3. Log deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("Network: Base Mainnet");
        console.log("ReputationOracle:", address(oracle));
        console.log("KindredHook:", address(hook));
        console.log("========================\n");
        
        vm.stopBroadcast();
    }
}

/**
 * @title DeployTestnet
 * @notice Deploy to Base Sepolia testnet with test data
 */
contract DeployTestnet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy ReputationOracle
        ReputationOracle oracle = new ReputationOracle();
        console.log("ReputationOracle deployed at:", address(oracle));
        
        // 2. Deploy KindredHook
        KindredHook hook = new KindredHook(address(oracle));
        console.log("KindredHook deployed at:", address(hook));
        
        // 3. Set up test reputation scores
        address[] memory testUsers = new address[](4);
        testUsers[0] = 0x1111111111111111111111111111111111111111; // Elite
        testUsers[1] = 0x2222222222222222222222222222222222222222; // Trusted
        testUsers[2] = 0x3333333333333333333333333333333333333333; // Normal
        testUsers[3] = 0x4444444444444444444444444444444444444444; // Risky
        
        uint256[] memory scores = new uint256[](4);
        scores[0] = 950;  // Elite tier
        scores[1] = 750;  // Trusted tier
        scores[2] = 500;  // Normal tier
        scores[3] = 200;  // Risky tier
        
        oracle.batchSetScores(testUsers, scores);
        console.log("Test reputation scores set for 4 users");
        
        // 4. Give deployer elite status
        oracle.setScore(deployer, 900);
        console.log("Deployer set to elite status");
        
        // Log summary
        console.log("\n=== Testnet Deployment Summary ===");
        console.log("Network: Base Sepolia");
        console.log("Deployer:", deployer);
        console.log("ReputationOracle:", address(oracle));
        console.log("KindredHook:", address(hook));
        console.log("==================================\n");
        
        vm.stopBroadcast();
    }
}
