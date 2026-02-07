// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {KindClaw} from "../src/KindClaw.sol";

/**
 * @title DeployKindClawScript
 * @notice Deploy KindClaw arcade token to Base Sepolia
 */
contract DeployKindClawScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== KindClaw Deployment ===");
        console.log("Deployer:", deployer);
        console.log("Network:", block.chainid);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy KindClaw
        console.log("Deploying KindClaw...");
        KindClaw token = new KindClaw();
        console.log("KindClaw deployed at:", address(token));

        vm.stopBroadcast();

        // Print summary
        console.log("");
        console.log("=== Deployment Summary ===");
        console.log("KindClaw:", address(token));
        console.log("Symbol: KINDCLAW");
        console.log("Initial Supply: 1,000,000 KINDCLAW");
        console.log("Faucet Amount: 100 KINDCLAW per claim");
        console.log("Cooldown: 1 hour");
        console.log("");
        console.log("Next steps:");
        console.log("1. Update contracts.ts");
        console.log("2. Add to SimpleSwap liquidity");
        console.log("3. Create faucet UI");
    }
}
