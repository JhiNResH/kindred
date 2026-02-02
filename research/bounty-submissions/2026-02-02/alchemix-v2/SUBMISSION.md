# Alchemix V2 Bug Bounty Submission

## Title
Adapter DEX Swaps Use Zero Slippage Protection, Exposing Users to MEV Sandwich Attacks

## Severity
**Medium**

## Impact
Token adapters (WstETHAdapterOptimism, RETHAdapterV1) execute DEX swaps with `minAmountOut = 0`, allowing MEV bots to sandwich attack users during deposit/withdraw operations. While the outer AlchemistV2 has slippage protection, the adapter-level vulnerability allows attackers to extract value up to the user's slippage tolerance.

**Affected Assets:**
- User funds during wrap/unwrap operations on Optimism
- Estimated extractable value: Up to user's slippage tolerance per transaction

## Vulnerability Details

### Location
- `src/adapters/lido/WstETHAdapterOptimism.sol` - Lines 95, 114
- `src/adapters/rocket/RETHAdapterV1.sol` - Line 86

### Root Cause
The adapters call Velodrome's `swapExactTokensForTokens()` with hardcoded `minAmountOut = 0`:

```solidity
// WstETHAdapterOptimism.sol:95
uint256[] memory amounts = IVelodromeSwapRouterV2(velodromeRouter)
    .swapExactTokensForTokens(
        amount, 
        0,  // ⚠️ NO SLIPPAGE PROTECTION
        routes, 
        address(this), 
        block.timestamp
    );
```

### Attack Flow
1. User calls `withdrawUnderlying()` with 5% slippage tolerance
2. MEV bot detects pending transaction in mempool
3. Bot front-runs: swaps to manipulate Velodrome pool price by 4.9%
4. User's transaction executes at manipulated price
5. Bot back-runs: swaps back, extracting ~4.9% of user's withdrawal
6. User receives 4.9% less than fair value (within their tolerance, so no revert)

### Why This Matters
Even though AlchemistV2 has an outer slippage check:
```solidity
if (amountUnwrapped < minimumAmountOut) {
    revert SlippageExceeded(amountUnwrapped, minimumAmountOut);
}
```

The attacker can extract value **up to** the user's slippage tolerance without causing a revert. Users setting reasonable 1-5% slippage are vulnerable to losing that full amount on every transaction.

## Proof of Concept

See attached `AlchemixSlippagePoC.t.sol` - Foundry fork test demonstrating:
1. Fork Optimism mainnet at recent block
2. Simulate user withdrawal
3. Sandwich attack extracting value
4. User receives less than fair value

### Running the PoC
```bash
cd v2-foundry
forge test --match-contract AlchemixSlippagePoC --fork-url $OPTIMISM_RPC -vvv
```

## Recommendation

Pass the user's `minimumAmountOut` parameter to the adapter:

```solidity
// In ITokenAdapter.sol - add parameter
function unwrap(uint256 amount, address recipient, uint256 minAmountOut) external returns (uint256);

// In WstETHAdapterOptimism.sol
function unwrap(uint256 amount, address recipient, uint256 minAmountOut) external override returns (uint256) {
    // ...
    uint256[] memory amounts = IVelodromeSwapRouterV2(velodromeRouter)
        .swapExactTokensForTokens(
            amount, 
            minAmountOut,  // ✅ Pass user's slippage protection
            routes, 
            address(this), 
            block.timestamp
        );
    // ...
}
```

## References
- Velodrome Router documentation
- Similar vulnerability: [Reference to other MEV issues in DeFi]
