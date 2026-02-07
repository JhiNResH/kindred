// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {KindredHookV2} from "../src/KindredHookV2.sol";

/**
 * @title DeployHookV2Script
 * @notice Deploy enhanced KindredHookV2 with Anti-MEV, Circuit Breaker, and Referrals
 */
contract DeployHookV2Script is Script {
    // Base Sepolia addresses
    address constant REPUTATION_ORACLE = 0xb3Af55a046aC669642A8FfF10FC6492c22C17235;
    address constant MOCK_POOL_MANAGER = 0x7350Cc2655004d32e234094C847bfac789D19408;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== KindredHookV2 Deployment ===");
        console.log("Deployer:", deployer);
        console.log("Network:", block.chainid);
        console.log("ReputationOracle:", REPUTATION_ORACLE);
        console.log("MockPoolManager:", MOCK_POOL_MANAGER);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy KindredHookV2
        console.log("Deploying KindredHookV2...");
        KindredHookV2 hook = new KindredHookV2(REPUTATION_ORACLE, MOCK_POOL_MANAGER);
        console.log("KindredHookV2 deployed at:", address(hook));

        vm.stopBroadcast();

        // Print summary
        console.log("");
        console.log("=== Deployment Summary ===");
        console.log("KindredHookV2:", address(hook));
        console.log("");
        console.log("Features:");
        console.log("1. Anti-MEV Priority Queue");
        console.log("   - High Trust (>=850): Priority 3 (Immediate)");
        console.log("   - Medium Trust (600-849): Priority 2 (Normal)");
        console.log("   - Low Trust (<600): Priority 1 (Delayed, MEV protection)");
        console.log("");
        console.log("2. Circuit Breaker");
        console.log("   - Warning threshold: 5% of pool");
        console.log("   - Max swap: 10% of pool");
        console.log("");
        console.log("3. Referral System");
        console.log("   - Referrer gets 20% of fees");
        console.log("   - Min referrer reputation: 700");
        console.log("   - Reputation boost: +10 per referral");
        console.log("");
        console.log("4. AI Agent Protection");
        console.log("   - Lower reputation requirement: 300");
        console.log("   - Auto reputation boost on registration");
        console.log("   - Same priority protection as users");
        console.log("");
        console.log("Next steps:");
        console.log("1. Update contracts.ts with new address");
        console.log("2. Add Priority Badge to SwapInterface");
        console.log("3. Add Referral Widget");
        console.log("4. Test agent registration");
    }
}
