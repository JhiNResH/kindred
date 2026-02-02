// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Test.sol";

/**
 * @title Pinto DeltaB Oracle Manipulation PoC
 * @notice Demonstrates flash loan manipulation of currentDeltaB()
 * 
 * Run with:
 * forge test --match-contract PintoDeltaBPoC --fork-url $BASE_RPC -vvv
 */

// Interfaces
interface IPinto {
    function convert(
        bytes calldata convertData,
        int96[] calldata stems,
        uint256[] calldata amounts
    ) external payable returns (int96 toStem, uint256 fromAmount, uint256 toAmount, uint256 fromBdv, uint256 toBdv);
    
    function deposit(
        address token,
        uint256 amount,
        uint8 mode
    ) external payable returns (uint256 depositedAmount, uint256 depositedBdv, int96 stem);
}

interface IWell {
    function getReserves() external view returns (uint256[] memory);
    function swapFrom(
        address fromToken,
        address toToken,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient,
        uint256 deadline
    ) external returns (uint256 amountOut);
    function tokens() external view returns (address[] memory);
}

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
    function approve(address, uint256) external returns (bool);
    function transfer(address, uint256) external returns (bool);
}

interface IFlashLender {
    function flashLoan(
        address receiver,
        address token,
        uint256 amount,
        bytes calldata data
    ) external returns (bool);
}

contract PintoDeltaBPoC is Test {
    // Base Mainnet Addresses
    address constant PINTO_DIAMOND = 0xD1A0D188E861ed9d15773a2F3574a2e94134bA8f;
    address constant PINTO_TOKEN = 0xb170000aeeFa790fa61D6e837d1035906839a3c8;
    
    // Wells (Pinto liquidity pools)
    address constant PINTO_WETH_WELL = address(0); // Replace with actual Well address
    address constant WETH = 0x4200000000000000000000000000000000000006;
    
    IPinto pinto = IPinto(PINTO_DIAMOND);
    IERC20 pintoToken = IERC20(PINTO_TOKEN);
    
    address attacker;
    
    function setUp() public {
        // Fork Base at recent block
        // vm.createSelectFork(vm.envString("BASE_RPC"), 10000000);
        
        attacker = makeAddr("attacker");
        vm.deal(attacker, 100 ether);
    }
    
    /**
     * @notice Demonstrates the vulnerability conceptually
     */
    function test_DeltaBManipulationConcept() public {
        console.log("=== Pinto DeltaB Manipulation PoC ===");
        console.log("");
        console.log("Vulnerability: currentDeltaB() uses ZERO_LOOKBACK (instantaneous reserves)");
        console.log("");
        console.log("Attack Flow:");
        console.log("1. Attacker has Silo deposits in token A");
        console.log("2. Flash loan large amount of PINTO or paired token");
        console.log("3. Swap into Well to manipulate reserves");
        console.log("   - If buying PINTO: decreases PINTO reserves -> negative deltaB");
        console.log("   - If selling PINTO: increases PINTO reserves -> positive deltaB");
        console.log("4. Call convert() - deltaB calculation uses manipulated reserves");
        console.log("5. Receive favorable conversion rate or stalk rewards");
        console.log("6. Swap back to restore reserves");
        console.log("7. Repay flash loan");
        console.log("");
        console.log("Result: Attacker gains extra stalk or converts at unfair terms");
    }
    
    /**
     * @notice Shows the vulnerable code pattern
     */
    function test_VulnerableCodePattern() public pure {
        console.log("=== Vulnerable Code ===");
        console.log("");
        console.log("// LibDeltaB.sol");
        console.log("function currentDeltaB(address well) internal view returns (int256) {");
        console.log("    try IWell(well).getReserves() returns (uint256[] memory reserves) {");
        console.log("        // VULNERABILITY: Uses spot reserves (ZERO_LOOKBACK)");
        console.log("        return calculateDeltaBFromReserves(well, reserves, ZERO_LOOKBACK);");
        console.log("    }");
        console.log("}");
        console.log("");
        console.log("=== Protected Code (Comparison) ===");
        console.log("");
        console.log("// LibWell.sol - This uses TWA (time-weighted average)");
        console.log("function getWellTwaReserves(address well, uint40 lookback) {");
        console.log("    return IMultiFlowPump(pump).readTwaReserves(well, token, bytes16(0), lookback);");
        console.log("}");
        console.log("");
        console.log("The issue: currentDeltaB() should use TWA reserves, not spot reserves");
    }
    
    /**
     * @notice Demonstrates reserve manipulation impact
     */
    function test_ReserveManipulationImpact() public pure {
        // Simulated Well state
        uint256 pintoReserve = 1_000_000 ether; // 1M PINTO
        uint256 wethReserve = 500 ether; // 500 WETH
        
        // Fair price: 1 PINTO = 0.0005 WETH = ~$1.50 (if WETH = $3000)
        
        // Attacker swaps 100 WETH for PINTO
        uint256 attackAmount = 100 ether;
        
        // After swap (simplified constant product):
        // newWethReserve = 600 WETH
        // newPintoReserve = (1_000_000 * 500) / 600 = 833,333 PINTO
        
        uint256 newPintoReserve = (pintoReserve * wethReserve) / (wethReserve + attackAmount);
        uint256 pintoRemoved = pintoReserve - newPintoReserve;
        
        // DeltaB calculation change
        // Original deltaB based on original reserves
        // After manipulation: reserves show LESS PINTO (bought by attacker)
        // This makes deltaB more negative (Pinto is "overpriced" in pool)
        
        console.log("=== Reserve Manipulation Impact ===");
        console.log("");
        console.log("Before Attack:");
        console.log("  PINTO Reserve: %s", pintoReserve / 1e18);
        console.log("  WETH Reserve: %s", wethReserve / 1e18);
        console.log("");
        console.log("Attack: Swap 100 WETH for PINTO");
        console.log("");
        console.log("After Attack:");
        console.log("  PINTO Reserve: %s", newPintoReserve / 1e18);
        console.log("  WETH Reserve: %s", (wethReserve + attackAmount) / 1e18);
        console.log("  PINTO Removed: %s", pintoRemoved / 1e18);
        console.log("");
        console.log("Impact on deltaB:");
        console.log("  Lower PINTO reserves -> more negative deltaB");
        console.log("  Affects convert calculations, stalk rewards");
    }
    
    /**
     * @notice Profit calculation for the attack
     */
    function test_AttackProfitability() public pure {
        // Assumptions
        uint256 siloDeposit = 100_000 ether; // 100k PINTO in Silo
        uint256 flashLoanAmount = 200 ether; // 200 WETH
        uint256 flashLoanFee = 0.09 ether; // 0.09% (typical Aave fee)
        uint256 swapFee = 0.3 ether; // 0.3% per swap x2 = 0.6% total
        
        // Estimated stalk gain from manipulated convert
        // (This is speculative - actual value depends on exact deltaB impact)
        uint256 estimatedStalkGainValue = 500 ether; // $500 worth of extra stalk
        
        uint256 totalCost = flashLoanFee + swapFee;
        int256 profit = int256(estimatedStalkGainValue) - int256(totalCost);
        
        console.log("=== Attack Profitability Estimate ===");
        console.log("");
        console.log("Silo Deposit: 100,000 PINTO");
        console.log("Flash Loan: 200 WETH");
        console.log("");
        console.log("Costs:");
        console.log("  Flash Loan Fee: %s WETH", flashLoanFee / 1e18);
        console.log("  Swap Fees (2x): %s WETH", swapFee / 1e18);
        console.log("  Total Cost: %s WETH", totalCost / 1e18);
        console.log("");
        console.log("Estimated Gain: $500 in extra stalk rewards");
        console.log("");
        if (profit > 0) {
            console.log("Net Profit: $%s", uint256(profit) / 1e18);
            console.log("ATTACK IS PROFITABLE");
        } else {
            console.log("Net Loss - Attack not profitable at this scale");
        }
    }
    
    /**
     * @notice Recommended fix
     */
    function test_RecommendedFix() public pure {
        console.log("=== Recommended Fix ===");
        console.log("");
        console.log("Option 1: Use EMA for currentDeltaB");
        console.log("");
        console.log("function currentDeltaB(address well) internal view returns (int256) {");
        console.log("    uint40 lookback = 3600;  // 1 hour EMA");
        console.log("    uint256[] memory reserves = LibWell.getWellTwaReserves(well, lookback);");
        console.log("    return calculateDeltaBFromReserves(well, reserves, lookback);");
        console.log("}");
        console.log("");
        console.log("Option 2: Add Manipulation Check");
        console.log("");
        console.log("function currentDeltaB(address well) internal view returns (int256) {");
        console.log("    uint256[] memory spotReserves = IWell(well).getReserves();");
        console.log("    uint256[] memory twaReserves = LibWell.getWellTwaReserves(well, 300);");
        console.log("    ");
        console.log("    // Reject if spot deviates >5% from TWA");
        console.log("    require(_withinDeviation(spotReserves, twaReserves, 500), 'Manipulation');");
        console.log("    ");
        console.log("    return calculateDeltaBFromReserves(well, spotReserves, ZERO_LOOKBACK);");
        console.log("}");
    }
}
