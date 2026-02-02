# 🛡️ Alchemix V2 Security Audit Report

**Date:** 2026-02-02 04:00 AM PST  
**Auditor:** Patrick Collins (賞金獵人)  
**Target:** Alchemix Finance v2-foundry  
**Bounty Program:** [Immunefi](https://immunefi.com/bug-bounty/alchemix/) - Max $300k, No KYC  
**Response Time:** 3 days (historically paid $205k)

---

## Executive Summary

Alchemix is a self-repaying loan protocol where users deposit yield-bearing collateral, borrow alUSD/alETH against it, and the yield automatically pays down the debt over time.

**Risk Level:** 🟡 Medium (Well-architected with proper guards, but complex cross-contract interactions)

**Key Components Reviewed:**
- AlchemistV2.sol (73KB main vault contract)
- TransmuterV2.sol (transmutation engine)
- TransmuterBuffer.sol (fund buffering)
- Token Adapters (Lido, Rocket Pool, Yearn, etc.)

---

## Architecture Overview

| Component | Description | Risk Level |
|-----------|-------------|------------|
| AlchemistV2 | Main vault - deposit, mint, withdraw, liquidate | Medium |
| TransmuterV2 | 1:1 synthetic→underlying exchange with tick system | Medium |
| TransmuterBuffer | Flow-controlled buffer between Alchemist & Transmuter | Low |
| Token Adapters | Wrap/unwrap yield tokens (wstETH, rETH, yvDAI, etc.) | **High** |
| Limiters | Rate limiting for mint/repay/liquidation | Low |

---

## Static Analysis Results

### Slither Summary (v0.11.5)

| Severity | Count | Notable |
|----------|-------|---------|
| High | 1 | delegatecall-loop in Multicall |
| Medium | 16 | reentrancy-no-eth, incorrect-equality |
| Low | 24 | unused-return, missing-zero-check |
| Info | 100+ | Gas optimizations |

### Semgrep Summary (v1.149.0)

| Category | Count |
|----------|-------|
| no-slippage-check | **4** |
| erc20-public-burn | 1 (mock only) |
| Performance | 287 |

---

## Key Findings

### 🟠 MEDIUM - Adapter Slippage Exposure (MEV Risk)

**File:** `src/adapters/lido/WstETHAdapterOptimism.sol:95, 114`  
**Also in:** `src/adapters/rocket/RETHAdapterV1.sol:86`

```solidity
// WstETHAdapterOptimism.sol - wrap/unwrap functions
uint256[] memory amounts = IVelodromeSwapRouterV2(velodromeRouter)
    .swapExactTokensForTokens(
        amount, 
        0,  // ⚠️ minAmountOut = 0 - NO SLIPPAGE PROTECTION
        routes, 
        address(this), 
        block.timestamp
    );
```

**Issue:** Adapters call DEX swaps with `minAmountOut = 0`, exposing transactions to sandwich attacks.

**Mitigating Factor:** AlchemistV2 has an outer slippage check:
```solidity
function _unwrap(...) internal returns (uint256) {
    uint256 amountUnwrapped = adapter.unwrap(amount, recipient);
    if (amountUnwrapped < minimumAmountOut) {
        revert SlippageExceeded(amountUnwrapped, minimumAmountOut);
    }
}
```

**Attack Scenario:**
1. Attacker front-runs user's `withdrawUnderlying` call
2. Manipulates Velodrome pool
3. Adapter swap returns less tokens
4. Either: (a) user gets worse rate within their slippage tolerance, or (b) tx reverts
5. Attacker extracts MEV profit

**Severity:** Medium - Value leakage via MEV, but not direct fund loss  
**Recommendation:** Pass `minimumAmountOut` to adapters for on-chain slippage protection

---

### 🟡 LOW - Delegatecall Loop in Multicall

**File:** `src/base/Multicall.sol:11-24`

```solidity
function multicall(bytes[] calldata data) external payable returns (bytes[] memory results) {
    results = new bytes[](data.length);
    for (uint256 i = 0; i < data.length; ++i) {
        (bool success, bytes memory result) = address(this).delegatecall(data[i]);
        if (!success) {
            revert MulticallFailed(data[i], result);
        }
        results[i] = result;
    }
}
```

**Analysis:**
- Slither flags `delegatecall inside a loop in a payable function`
- Risk: ETH stuck if delegatecalls revert mid-batch

**Mitigating Factors:**
1. Individual functions have `lock` modifier
2. First `lock` claim prevents re-entering locked functions
3. Function reverts on ANY failure, returning ETH

**Severity:** Low/Informational - Lock mechanism provides protection  
**Recommendation:** Consider adding `lock` to `multicall` itself for defense-in-depth

---

### 🟡 LOW - Reentrancy Patterns (Mitigated)

**Files:** AlchemistV2.sol - `harvest()`, `liquidate()`, `depositUnderlying()`

Slither detected reentrancy patterns where state updates occur after external calls. Example in `harvest()`:

```solidity
function harvest(address yieldToken, uint256 minimumAmountOut) external override lock {
    // ... 
    yieldTokenParams.harvestableBalance = 0;  // ✅ Clear before external call
    
    uint256 amountUnderlyingTokens = _unwrap(...);  // External call to adapter
    
    _distributeCredit(yieldToken, credit);  // State update after external call
    // ...
}
```

**Analysis:**
1. `lock` modifier prevents re-entering any lock-protected function
2. Key state (`harvestableBalance`) cleared BEFORE external call
3. Code comments show developers are aware of reentrancy concerns

**Severity:** Low - Properly mitigated by lock mechanism  
**Recommendation:** None - current pattern is acceptable

---

### ℹ️ INFO - Strict Equality Checks

**Files:** Multiple locations in AlchemistV2.sol

```solidity
// Example: AlchemistV2.sol:1628
if (_yieldTokens[yieldToken].totalShares == 0) { ... }

// Example: AlchemistV2.sol:1390  
if (currentAccruedWeight == lastAccruedWeight) { return; }
```

**Analysis:** 
These are intentional early-exit checks for efficiency. Not exploitable because:
- `totalShares == 0` check is for first depositor logic
- `accruedWeight` comparison is for skip-if-no-change optimization

**Severity:** Informational

---

## Access Control Analysis

| Role | Functions | Risk |
|------|-----------|------|
| admin | All config changes, token additions, fee changes | Low (2-step) |
| sentinel | Pause tokens (emergency) | Low |
| keeper | Harvest, sync operations | Low |
| whitelist | All user functions | Medium |

**Positive:** Two-step admin transfer (`setPendingAdmin` → `acceptAdmin`)

---

## Entry Points Summary

| Category | Count | Examples |
|----------|-------|----------|
| Public (Unrestricted) | 0 | All require whitelist |
| Whitelisted Users | 12 | deposit, withdraw, mint, burn, repay, liquidate |
| Keeper Only | 2 | harvest, snap |
| Admin Only | 18 | All config functions |

---

## Contracts In Scope (Immunefi)

| Contract | Status |
|----------|--------|
| AlchemistV2 | ✅ Reviewed |
| TransmuterV2 | ✅ Reviewed |
| TransmuterBuffer | ✅ Reviewed |
| WstETHAdapterOptimism | ⚠️ Slippage issue found |
| RETHAdapterV1 | ⚠️ Slippage issue found |
| Other Adapters | 🔍 Partial review |

---

## Recommendations

### Immediate (Bounty-worthy)

1. **Pass slippage parameter to adapter swaps** - The adapter-level swaps should use the user's `minimumAmountOut` instead of hardcoded 0

### Long-term

2. **Add lock to multicall** - Defense-in-depth against potential future issues
3. **Adapter standardization** - Create base adapter with slippage handling

---

## PoC Development Status

| Finding | PoC Ready | Bounty Potential |
|---------|-----------|------------------|
| Adapter MEV exposure | 🔄 In Progress | $10k-50k (Medium) |
| Delegatecall loop | ❌ Informational | None |
| Reentrancy patterns | ❌ Mitigated | None |

---

## Next Steps

1. **Develop PoC for adapter slippage** - Demonstrate MEV extraction on Optimism fork
2. **Review remaining adapters** - Yearn, Aave, Vesper, Fuse adapters
3. **Deep dive into Transmuter tick logic** - Complex math, potential for precision issues
4. **Cross-contract accounting audit** - Verify token flow integrity

---

## Tools Used

- Slither 0.11.5
- Semgrep 1.149.0
- Manual code review (Trail of Bits methodology)

---

## Appendix: File Structure

```
src/
├── AlchemistV2.sol          # Main vault (73KB) ✅
├── TransmuterV2.sol         # Exchange engine ✅
├── TransmuterBuffer.sol     # Flow control ✅
├── adapters/
│   ├── lido/                # wstETH adapters ⚠️
│   ├── rocket/              # rETH adapter ⚠️
│   ├── yearn/               # yvToken adapters 🔍
│   └── ...
├── libraries/
│   ├── Limiters.sol         # Rate limiting ✅
│   ├── SafeCast.sol         # Type safety ✅
│   └── TokenUtils.sol       # Safe transfers ✅
└── base/
    ├── Multicall.sol        # Batch calls ⚠️
    └── Mutex.sol            # Reentrancy guard ✅
```

---

*Report generated by Patrick Collins 🛡️ - Trail of Bits methodology*  
*Total audit time: ~60 minutes*
