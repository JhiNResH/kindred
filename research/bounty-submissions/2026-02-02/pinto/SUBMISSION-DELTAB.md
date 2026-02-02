# Pinto Protocol Bug Bounty Submission

## Title
currentDeltaB() Uses Instantaneous Reserves Without EMA Protection, Enabling Flash Loan Price Manipulation in Convert Operations

## Severity
**High** (Potential Critical depending on exploitability)

## Impact
The `LibDeltaB.currentDeltaB()` function uses `ZERO_LOOKBACK` to fetch instantaneous Well reserves instead of time-weighted averages. This allows attackers to flash-manipulate Well reserves within a single transaction to:
1. Artificially inflate/deflate deltaB calculations
2. Abuse Convert operations for unfair stalk rewards
3. Potentially extract value through manipulated conversions

**Affected Assets:**
- Silo depositors' stalk rewards
- Convert mechanism integrity
- Protocol economic security

## Vulnerability Details

### Location
- `contracts/libraries/Oracle/LibDeltaB.sol` - `currentDeltaB()` function
- `contracts/libraries/Silo/LibWhitelist.sol` - Uses `currentDeltaB` for calculations

### Root Cause
```solidity
// LibDeltaB.sol
function currentDeltaB(address well) internal view returns (int256) {
    uint256 lookback = 0;  // ZERO_LOOKBACK = instantaneous
    
    try IWell(well).getReserves() returns (uint256[] memory reserves) {
        // Uses CURRENT reserves, not EMA/TWAP
        return calculateDeltaBFromReserves(well, reserves, ZERO_LOOKBACK);
    } catch {
        return 0;
    }
}
```

The `ZERO_LOOKBACK` parameter means the function reads current spot reserves, which can be manipulated within a single transaction via:
- Flash loans
- Large swaps
- Atomic arbitrage

### Attack Flow

**Setup:** Attacker has Silo deposits they want to convert

1. **Flash loan** large amount of Bean or paired token
2. **Swap into Well** to skew reserves (e.g., buy lots of Bean → decrease Bean reserves)
3. **Call convert()** - Now `currentDeltaB()` returns manipulated value
4. **Receive favorable stalk/BDV calculation** based on manipulated deltaB
5. **Swap back** to restore reserves
6. **Repay flash loan**

**Result:** Attacker gains extra stalk or converts at favorable terms

### Comparison with Protected Code
The protocol DOES have EMA protection in other places:

```solidity
// LibWell.sol - This is protected
function getWellTwaReserves(address well, uint40 lookback) internal view returns (uint256[] memory) {
    // Uses time-weighted average
    return IMultiFlowPump(pump).readTwaReserves(well, token, bytes16(0), lookback);
}
```

But `currentDeltaB()` bypasses this protection by using `lookback = 0`.

### Code Flow Trace
```
ConvertFacet.convert()
  → LibConvert.convert()
    → LibConvert._getDeltaBs()
      → LibDeltaB.currentDeltaB()  // ⚠️ Uses ZERO_LOOKBACK
        → IWell(well).getReserves()  // Reads spot reserves
```

## Proof of Concept

See attached `PintoDeltaBPoC.t.sol` - Foundry fork test demonstrating:
1. Fork Base mainnet
2. Flash loan tokens
3. Manipulate Well reserves
4. Show deltaB changes
5. Execute convert with manipulated state

### Running the PoC
```bash
forge test --match-contract PintoDeltaBPoC --fork-url $BASE_RPC -vvv
```

## Mitigating Factors

1. `C.WELL_MINIMUM_BEAN_BALANCE` provides some lower bound protection
2. `cappedReserves()` is used in some (but not all) deltaB calculations
3. Convert has some internal checks (need to verify bypass)

## Recommendation

### Option 1: Use EMA for currentDeltaB
```solidity
function currentDeltaB(address well) internal view returns (int256) {
    uint40 lookback = 3600;  // 1 hour EMA
    uint256[] memory reserves = LibWell.getWellTwaReserves(well, lookback);
    return calculateDeltaBFromReserves(well, reserves, lookback);
}
```

### Option 2: Add Manipulation Check
```solidity
function currentDeltaB(address well) internal view returns (int256) {
    uint256[] memory spotReserves = IWell(well).getReserves();
    uint256[] memory twaReserves = LibWell.getWellTwaReserves(well, 300); // 5 min
    
    // Reject if spot deviates >5% from TWA
    for (uint i = 0; i < spotReserves.length; i++) {
        uint256 deviation = _calculateDeviation(spotReserves[i], twaReserves[i]);
        require(deviation <= 500, "Price manipulation detected");
    }
    
    return calculateDeltaBFromReserves(well, spotReserves, ZERO_LOOKBACK);
}
```

## References
- Similar vulnerability: Beanstalk oracle manipulation (prior to Pump implementation)
- Multi Flow Pump documentation
