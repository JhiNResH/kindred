// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {SimpleSwap} from "../src/SimpleSwap.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AddSwapLiquidityScript
 * @notice Add ETH and USDC liquidity to SimpleSwap
 */
contract AddSwapLiquidityScript is Script {
    address constant SIMPLE_SWAP = 0x2b50678df7FDb8Baba5867DC5de4F05432CbEf71;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Adding Liquidity to SimpleSwap ===");
        console.log("Deployer:", deployer);
        console.log("SimpleSwap:", SIMPLE_SWAP);
        console.log("USDC:", USDC);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        SimpleSwap swap = SimpleSwap(payable(SIMPLE_SWAP));
        IERC20 usdc = IERC20(USDC);

        // Check balances before
        uint256 deployerUSDC = usdc.balanceOf(deployer);
        uint256 deployerETH = deployer.balance;
        console.log("Deployer USDC balance:", deployerUSDC / 1e6, "USDC");
        console.log("Deployer ETH balance:", deployerETH / 1e18, "ETH");

        // Add ETH liquidity (0.1 ETH)
        uint256 ethAmount = 0.1 ether;
        if (deployerETH >= ethAmount) {
            console.log("\nAdding ETH liquidity:", ethAmount / 1e18, "ETH");
            swap.addLiquidityETH{value: ethAmount}();
            console.log("ETH liquidity added!");
        } else {
            console.log("\nSkipping ETH (insufficient balance)");
        }

        // Add USDC liquidity (use available balance)
        uint256 usdcAmount = deployerUSDC > 0 ? deployerUSDC : 20 * 1e6; // Use all or 20 USDC
        if (deployerUSDC >= usdcAmount) {
            console.log("\nAdding USDC liquidity:", usdcAmount / 1e6, "USDC");
            
            // Approve
            console.log("Approving USDC...");
            usdc.approve(SIMPLE_SWAP, usdcAmount);
            
            // Add liquidity
            console.log("Adding liquidity...");
            swap.addLiquidityUSDC(usdcAmount);
            console.log("USDC liquidity added!");
        } else {
            console.log("\nSkipping USDC (insufficient balance)");
            console.log("Need to mint USDC first!");
        }

        vm.stopBroadcast();

        // Check balances after
        (uint256 ethBalance, uint256 usdcBalance) = swap.getBalances();
        console.log("");
        console.log("=== SimpleSwap Balances ===");
        console.log("ETH:", ethBalance / 1e18, "ETH");
        console.log("USDC:", usdcBalance / 1e6, "USDC");
    }
}
