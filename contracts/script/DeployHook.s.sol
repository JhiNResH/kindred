// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ReputationOracle} from "../src/ReputationOracle.sol";
import {KindredHook} from "../src/KindredHook.sol";

/**
 * @title MockPoolManager
 * @notice Minimal mock for testing/demo purposes
 * @dev In production, use actual Uniswap v4 PoolManager address
 */
contract MockPoolManager {
    function getLock(uint256) external pure returns (address, address) {
        return (address(0), address(0));
    }
}

/**
 * @title DeployHookScript
 * @notice Deploy KindredHook and ReputationOracle to Base Sepolia
 * @dev Run with: forge script script/DeployHook.s.sol:DeployHookScript --rpc-url $RPC_URL --broadcast
 */
contract DeployHookScript is Script {
    function run() external {
        // Load deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== KindredHook Deployment ===");
        console.log("Deployer:", deployer);
        console.log("Network:", block.chainid);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy ReputationOracle
        console.log("Deploying ReputationOracle...");
        ReputationOracle oracle = new ReputationOracle();
        console.log("ReputationOracle deployed at:", address(oracle));

        // 2. Deploy MockPoolManager (for demo/testing)
        // NOTE: In production, use actual Uniswap v4 PoolManager address
        console.log("Deploying MockPoolManager (demo only)...");
        MockPoolManager poolManager = new MockPoolManager();
        console.log("MockPoolManager deployed at:", address(poolManager));
        console.log("WARNING: For production, replace with actual Uniswap v4 PoolManager");

        // 3. Deploy KindredHook
        console.log("Deploying KindredHook...");
        KindredHook hook = new KindredHook(
            address(oracle),
            address(poolManager)
        );
        console.log("KindredHook deployed at:", address(hook));

        // 4. Set up initial reputation scores for demo
        console.log("");
        console.log("Setting up demo reputation scores...");
        
        // High trust user (0.15% fee)
        oracle.setScore(deployer, 900);
        console.log("Deployer reputation set to 900 (high trust)");
        
        // Example medium trust (0.22% fee)
        address mediumUser = address(0x1111111111111111111111111111111111111111);
        oracle.setScore(mediumUser, 700);
        console.log("Example medium trust user (700):", mediumUser);
        
        // Example low trust (0.30% fee)
        address lowUser = address(0x2222222222222222222222222222222222222222);
        oracle.setScore(lowUser, 500);
        console.log("Example low trust user (500):", lowUser);

        vm.stopBroadcast();

        // Print summary
        console.log("");
        console.log("=== Deployment Summary ===");
        console.log("Network:", block.chainid);
        console.log("ReputationOracle:", address(oracle));
        console.log("MockPoolManager:", address(poolManager));
        console.log("KindredHook:", address(hook));
        console.log("");
        console.log("Fee Tiers:");
        console.log("- High Trust (>=850): 0.15%");
        console.log("- Medium Trust (600-849): 0.22%");
        console.log("- Low Trust (<600): 0.30%");
        console.log("");
        console.log("Next steps:");
        console.log("1. Update src/lib/contracts.ts with these addresses");
        console.log("2. Create UI to demonstrate dynamic fee calculation");
        console.log("3. Show fee changes based on reputation score");
        console.log("4. Add reputation score display in user profile");
    }
}
