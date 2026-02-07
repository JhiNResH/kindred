// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/KindClawToken.sol";
import "../src/OpenWorkMock.sol";

contract DeployArcadeTokens is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy KindClaw Token
        KindClawToken kindclaw = new KindClawToken();
        console.log("KindClaw Token deployed at:", address(kindclaw));
        
        // Deploy OpenWork Mock
        OpenWorkMock openwork = new OpenWorkMock();
        console.log("OpenWork Mock deployed at:", address(openwork));
        
        vm.stopBroadcast();
        
        // Print summary
        console.log("\n=== Deployment Summary ===");
        console.log("KINDCLAW:", address(kindclaw));
        console.log("OPENWORK (mock):", address(openwork));
        console.log("\nAdd to contracts.ts:");
        console.log("kindClawToken: { address: '%s', abi: KindClawTokenABI },", address(kindclaw));
        console.log("openWorkToken: { address: '%s', abi: OpenWorkMockABI },", address(openwork));
    }
}
