// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/KindredSettlement.sol";
import "../src/KindToken.sol";

/**
 * @title DeploySettlement
 * @notice Deployment script for KindredSettlement
 * @dev Usage: forge script DeploySettlement --rpc-url $RPC_URL --broadcast
 * 
 * Environment Variables:
 * - PRIVATE_KEY: Deployer private key
 * - KIND_TOKEN: Existing KindToken address (optional)
 * - TREASURY: Treasury address
 * 
 * @author Jensen Huang 🐺 | Team Kindred
 */
contract DeploySettlement is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Try to get existing KindToken, deploy new one if not set
        address kindToken;
        try vm.envAddress("KIND_TOKEN") returns (address _kindToken) {
            kindToken = _kindToken;
            console.log("Using existing KindToken:", kindToken);
        } catch {
            // Deploy new KindToken for testing
            address deployer = vm.addr(deployerPrivateKey);
            KindToken token = new KindToken(deployer);
            kindToken = address(token);
            console.log("Deployed new KindToken:", kindToken);
        }
        
        // Deploy Settlement
        KindredSettlement settlement = new KindredSettlement(kindToken, treasury);
        console.log("Deployed KindredSettlement:", address(settlement));
        
        // Start first round
        uint256 roundId = settlement.startRound();
        console.log("Started Round:", roundId);
        
        vm.stopBroadcast();
        
        // Output for verification
        console.log("---");
        console.log("Deployment Summary:");
        console.log("  KindToken:", kindToken);
        console.log("  KindredSettlement:", address(settlement));
        console.log("  Treasury:", treasury);
        console.log("  Initial Round:", roundId);
    }
}
