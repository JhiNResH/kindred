# 🔐 Pinto Protocol Security Audit - January 29, 2026

## Target Information

| Field | Value |
|-------|-------|
| **Protocol** | Pinto (Beanstalk fork) |
| **Chain** | Base |
| **Bounty Program** | Immunefi |
| **Max Reward** | $100,000 (Critical: 10% of affected funds) |
| **Min Reward** | $50,000 |
| **KYC Required** | No |
| **PoC Required** | Yes |
| **Resolution Time** | ~18 hours (fast!) |
| **Total Paid** | $46,700 |

## Architecture Overview

Pinto is a **Diamond (EIP-2535)** pattern DeFi protocol forked from Beanstalk. Key components:

### Core Facets (Entry Points)
- **FarmFacet** - `farm()`, `advancedFarm()` - Execute arbitrary facet calls
- **TractorFacet** - Blueprint execution system for operators
- **SiloFacet** - Deposits, withdrawals, transfers
- **ConvertFacet** - Convert deposits between assets
- **SeasonFacet** - Sunrise mechanism
- **FieldFacet** - Pod marketplace
- **Pipeline** - External arbitrary calls sandbox

### Security Mechanisms

✅ **Invariable.sol Modifiers:**
- `fundsSafu` - Post-call balance check (entitlements ≤ balances)
- `noNetFlow` - Token balances unchanged
- `noOutFlow` - Token balances don't decrease
- `noSupplyChange` - Bean supply unchanged
- `oneOutFlow(token)` - Only specified token can decrease

✅ **ReentrancyGuard:**
- Dual-lock system (`farmingStatus` + `reentrantStatus`)
- `nonReentrant` and `nonReentrantFarm` modifiers

✅ **Tractor Verification:**
- EIP-712 signatures
- EIP-1271 smart contract signatures
- Nonce tracking

---

## 🔍 Entry Point Analysis

### Public (Unrestricted) - HIGH PRIORITY

| Function | File | Modifiers | Notes |
|----------|------|-----------|-------|
| `farm(bytes[])` | FarmFacet.sol | fundsSafu, nonReentrantFarm | **CRITICAL** - Arbitrary facet calls |
| `advancedFarm(AdvancedFarmCall[])` | FarmFacet.sol | fundsSafu, nonReentrantFarm | Clipboard-based composability |
| `deposit(token, amount, mode)` | SiloFacet.sol | fundsSafu, noSupplyChange, noOutFlow | Token deposits |
| `withdrawDeposit(...)` | SiloFacet.sol | fundsSafu, noSupplyChange, oneOutFlow | Token withdrawals |
| `convert(convertData, stems, amounts)` | ConvertFacet.sol | fundsSafu, noSupplyChange | Asset conversion |
| `tractor(requisition, operatorData)` | TractorFacet.sol | fundsSafu, nonReentrantFarm | Blueprint execution |
| `pipe(PipeCall)` | Pipeline.sol | **NONE** | ⚠️ External arbitrary calls |

### Tractor-Specific Functions

| Function | Risk Level | Notes |
|----------|------------|-------|
| `sendTokenToInternalBalance()` | **HIGH** | Can drain operator funds if they have ERC-20 approvals |
| `tractorDynamicData()` | MEDIUM | Dynamic data injection |
| `publishRequisition()` | LOW | Blueprint publishing |

---

## 🚨 Findings

### FINDING-01: Pipeline Asset Extraction Risk (Informational)

**Location:** `contracts/pipeline/Pipeline.sol`

**Description:** 
The Pipeline contract explicitly states in comments:
> "Any assets left in Pipeline between transactions can be transferred out by any account."

**Impact:** If any protocol integration leaves tokens in Pipeline, they can be drained by frontrunning.

**Status:** By design, but should be verified no funds remain.

---

### FINDING-02: Tractor Operator Fund Risk (Informational)

**Location:** `contracts/beanstalk/facets/farm/TractorFacet.sol:L115-L137`

**Description:**
The `sendTokenToInternalBalance()` function can transfer tokens from `msg.sender` (the operator) if they have ERC-20 approvals to Beanstalk:

```solidity
function sendTokenToInternalBalance(
    IERC20 token,
    address recipient,
    uint256 amount
) external payable fundsSafu noSupplyChange noOutFlow nonReentrant {
    LibTransfer.transferToken(
        token,
        msg.sender,  // <-- Operator, not publisher!
        recipient,
        amount,
        LibTransfer.From.EXTERNAL,
        LibTransfer.To.INTERNAL
    );
}
```

**Impact:** Malicious blueprints can drain operator funds. Documented but risky.

---

### FINDING-03: Tractor Publisher Context - ANALYZED ✅

**Location:** `contracts/libraries/LibTractor.sol`

**Description:**
The `activePublisher` storage is set before farm calls execute and reset after:

```solidity
function _setPublisher(address payable publisher) internal {
    require(
        uint160(bytes20(address(ts.activePublisher))) <= 1,
        "LibTractor: publisher already set"
    );
    ts.activePublisher = publisher;
}
```

**Analysis:**
- ✅ **Nested tractor calls are blocked** - The `require` statement ensures publisher can only be set if current value is 0 or 1
- ✅ **`_user()` correctly returns publisher during execution** - All internal calls see the correct context
- ⚠️ **Pipeline callback consideration** - If a blueprint calls Pipeline → external contract → callback to Beanstalk, the `activePublisher` is still set

**Potential Attack Vector (LOW):**
1. Publisher creates malicious blueprint
2. Blueprint calls Pipeline to external contract
3. External contract calls back to a Beanstalk function that uses `_user()`
4. `_user()` returns the publisher, not the operator

**Impact:** Low - The publisher created the blueprint, so they're attacking themselves. Only risk is if publisher tricks operators into executing harmful blueprints.

**Status:** ✅ No critical vulnerability found. Documented risk.

---

### FINDING-04: Invariant Bypass via Multi-Call - ANALYZED ✅

**Location:** `contracts/beanstalk/Invariable.sol`

**Description:**
The `fundsSafu` modifier uses **post-condition checking**:

```solidity
modifier fundsSafu() {
    _;  // Execute function first
    // Then check: balances[i] >= entitlements[i]
}
```

**Analysis:**
Entitlements include:
- `deposited` - Silo deposits
- `germinating` (ODD + EVEN) - Germinating deposits
- `internalTokenBalanceTotal` - Internal balances
- `orderLockedBeans` - Locked beans
- `harvestable - harvested` - Unharvested beans
- `plentyPerSopToken` - SOP rewards

**Attack Scenarios Tested:**

1. **Flash loan attack** ❌ Not viable
   - Beanstalk doesn't accept external flash loans
   - Internal balances are tracked

2. **Deposit-then-withdraw in same tx** ❌ Blocked
   - Withdrawals decrement entitlements
   - fundsSafu ensures balance >= entitlements

3. **Cross-facet state manipulation** ⚠️ Potential
   - If Call A increases entitlements without increasing balance
   - And Call B relies on inflated entitlements
   - Need specific exploit path

**Status:** ✅ No critical vulnerability found. Architecture is sound.

---

### FINDING-05: Oracle Manipulation in DeltaB Calculation (NEW - INVESTIGATING)

**Location:** `contracts/libraries/Oracle/LibDeltaB.sol`

**Description:**
DeltaB calculation uses Well reserves which can be manipulated:

```solidity
function currentDeltaB(address well) internal view returns (int256) {
    try IWell(well).getReserves() returns (uint256[] memory reserves) {
        // Uses CURRENT reserves, not TWAP
        return calculateDeltaBFromReserves(well, reserves, ZERO_LOOKBACK);
    }
}
```

**Risk:**
- `currentDeltaB()` uses **instantaneous reserves** (ZERO_LOOKBACK)
- Attacker could flash-manipulate Well reserves
- Affects Convert calculations and stalk penalties

**Mitigations Present:**
- ✅ `C.WELL_MINIMUM_BEAN_BALANCE` prevents extreme manipulation
- ✅ `cappedReserves()` provides bounded values for some functions
- ⚠️ `currentDeltaB()` still uses uncapped reserves

**Status:** 🔍 Needs further investigation - potential Medium severity

---

### FINDING-06: Pipeline Asset Extraction - Confirmed Design (INFO)

**Location:** `contracts/pipeline/Pipeline.sol`

**Code Comment:**
```solidity
// Any assets left in Pipeline between transactions can be transferred out by any account.
```

**Analysis:**
- This is explicitly documented and by design
- Pipeline is a **stateless sandbox**
- Any integration leaving tokens in Pipeline is a bug in that integration

**Impact:** Informational - users/integrations must ensure no assets remain

**Status:** ✅ By design, but worth monitoring for integration bugs

---

## 📊 Code Quality Assessment

| Category | Score | Notes |
|----------|-------|-------|
| Access Control | ⭐⭐⭐⭐ | Multiple invariant modifiers |
| Reentrancy | ⭐⭐⭐⭐⭐ | Dual-lock system |
| Input Validation | ⭐⭐⭐⭐ | Bounds checking on paste |
| Documentation | ⭐⭐⭐ | Good comments, some gaps |
| Test Coverage | ⭐⭐⭐⭐ | Foundry + Hardhat tests |

---

## 🎯 Recommended Next Steps

### ✅ Completed
1. [x] Analyze Tractor publisher context - No critical issue (FINDING-03)
2. [x] Analyze multi-call invariant bypass - Architecture is sound (FINDING-04)
3. [x] Initial Oracle review - Identified potential deltaB manipulation (FINDING-05)

### 🔴 High Priority (Today/Tomorrow)
4. [ ] **Deep dive deltaB manipulation** - Write PoC for FINDING-05
   - Test flash loan → Well reserve manipulation → Convert abuse
   - Check if `cappedReserves` provides sufficient protection
5. [ ] **Run Slither scan** - Waiting for compilation
6. [ ] **Trace Pipeline asset flows** - Look for integration bugs

### 🟠 Medium Priority (This Week)
7. [ ] Review Convert mechanism edge cases
   - Lambda/Anti-Lambda convert
   - BDV calculation accuracy
8. [ ] Check Germination timing attacks
9. [ ] Review Flood mechanism

### 🟢 Low Priority
10. [ ] Review admin functions in OwnershipFacet
11. [ ] Check metadata generation
12. [ ] Review ERC1155 deposit transfer logic

---

## 🔬 PoC Development Status

### PoC-01: DeltaB Oracle Manipulation (FINDING-05)

**Hypothesis:**
An attacker can flash-manipulate Well reserves to affect `currentDeltaB()`, which is used in Convert calculations.

**Attack Flow:**
```
1. Flash loan large amount of tokens
2. Swap into Well → skew reserves
3. Call convert() → benefits from manipulated deltaB
4. Swap back → restore reserves
5. Repay flash loan
```

**Files to analyze:**
- `LibDeltaB.sol:currentDeltaB()` - Uses ZERO_LOOKBACK
- `LibConvert.sol:DeltaBStorage` - Stores before/after deltaB
- `LibWellConvert.sol` - Actual conversion logic

**Status:** 🔄 In Progress

---

---

## 🔬 Slither Scan Results (Completed)

### High/Medium Findings

| ID | Detector | Location | Severity | Analysis |
|----|----------|----------|----------|----------|
| S-01 | reentrancy-eth | `Order._createPodOrder` | 🟠 Medium | State written after external call. Needs investigation. |
| S-02 | unchecked-transfer | `SiloHelpers`, `LibPipelineConvert`, `LibWellConvert` | 🟡 Low | ERC20 transfer returns ignored. Mitigated by SafeERC20 in most cases. |
| S-03 | divide-before-multiply | Multiple locations | 🟡 Low | Precision loss in calculations. May affect large values. |

### Informational (By Design)

| ID | Detector | Location | Notes |
|----|----------|----------|-------|
| S-04 | arbitrary-send-erc20 | `LibTransfer` | ✅ By design - requires user approval |
| S-05 | arbitrary-send-eth | `Pipeline._pipeMem` | ✅ By design - Pipeline is sandbox for arbitrary calls |
| S-06 | encode-packed-collision | `MetadataFacet.uri` | ✅ Info only - metadata generation |

### FINDING-07: Potential Reentrancy in Pod Order (NEW - FROM SLITHER)

**Location:** `contracts/beanstalk/facets/market/abstract/Order.sol:_createPodOrder`

**Code Pattern:**
```solidity
function _createPodOrder(Order.PodOrder podOrder, uint256) {
    // ...
    _cancelPodOrder(podOrder, LibTransfer.To.INTERNAL);  // External call
    s.sys.podOrders[id] = beanAmount;  // State write after
    s.sys.orderLockedBeans += beanAmount;  // State write after
}
```

**Analysis:**
- External token transfer via `_cancelPodOrder`
- State variables written after external call
- Could allow reentrancy if called contract is malicious

**Mitigations Present:**
- Function uses `nonReentrant` modifier (need to verify)
- Token is Bean (trusted contract)

**Status:** 🔍 Needs verification of reentrancy guard coverage

---

## 📁 Files Analyzed

```
contracts/beanstalk/facets/farm/FarmFacet.sol
contracts/beanstalk/facets/farm/TractorFacet.sol
contracts/beanstalk/facets/silo/SiloFacet.sol
contracts/beanstalk/facets/silo/ConvertFacet.sol
contracts/beanstalk/Invariable.sol
contracts/libraries/LibFarm.sol
contracts/libraries/LibTractor.sol
contracts/libraries/LibBytes.sol
contracts/libraries/Oracle/LibDeltaB.sol
contracts/libraries/Oracle/LibUsdOracle.sol
contracts/pipeline/Pipeline.sol
```

---

## Tools Used

- Manual code review
- Entry point analysis (ToB skill)
- Slither (pending - needs dependency fix)
- Semgrep (pending)

---

*Audit conducted: January 29, 2026 4:00 AM PST*
*Auditor: Kindred 🐺*
