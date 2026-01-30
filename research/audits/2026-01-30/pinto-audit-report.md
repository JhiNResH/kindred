# 🛡️ Pinto Protocol Security Audit Report
**Date:** 2026-01-30 04:00 AM PST  
**Auditor:** Patrick Collins (賞金獵人)  
**Target:** Pinto Protocol (pinto-org/protocol)  
**Bounty Program:** [Immunefi](https://immunefi.com/bug-bounty/pinto/) - Max $100k, No KYC, 19hr response  

---

## Executive Summary

Pinto is a "low volatility money" protocol built on Base, forked from Beanstalk. It uses a Diamond pattern (EIP-2535) with multiple facets for Silo deposits, Field sowing, and a Tractor system for automated blueprint execution.

**Risk Level:** 🟡 Medium-High (Complex DeFi protocol with multiple attack surfaces)

---

## Architecture Overview

| Component | Description | Risk |
|-----------|-------------|------|
| Diamond Proxy | EIP-2535 multi-facet upgradeable pattern | Medium |
| SiloFacet | Deposit/Withdraw/Transfer of whitelisted tokens | High |
| FieldFacet | Sowing beans for Pods (debt instruments) | Medium |
| TractorFacet | Signed blueprint execution by operators | **Critical** |
| Pipeline | Arbitrary external call sandbox | **Critical** |
| Convert | Asset conversion within Silo | Medium |
| Price/Oracle | EMA-based price from Wells/Pumps | High |

---

## Key Findings

### 🔴 CRITICAL - Potential Issues Requiring Deep Investigation

#### 1. Pipeline Sandbox - Asset Extraction Risk
**File:** `contracts/pipeline/Pipeline.sol`

```solidity
// Any assets left in Pipeline between transactions can be transferred out by any account.
receive() external payable {}

function pipe(PipeCall calldata p) external payable override returns (bytes memory result) {
    result = _pipe(p.target, p.data, msg.value);
}
```

**Issue:** Pipeline allows arbitrary external calls with value. While documented as a "sandbox", any assets (ETH, ERC20s, NFTs) left in the Pipeline contract can be extracted by anyone. Need to verify:
- Can a user deposit to Pipeline and have assets extracted in same block by MEV?
- Are there any internal functions that leave residual balances?

**Status:** Needs PoC development

---

#### 2. Tractor Blueprint Operator Paste Injection
**File:** `contracts/libraries/LibTractor.sol`

```solidity
// Update data with operator-defined fillData.
for (uint256 i; i < requisition.blueprint.operatorPasteInstrs.length; ++i) {
    bytes32 operatorPasteInstr = requisition.blueprint.operatorPasteInstrs[i];
    uint80 pasteCallIndex = LibBytes.getIndex1(operatorPasteInstr);
    require(calls.length > pasteCallIndex, "LibTractor: pasteCallIndex OOB");

    LibBytes.pasteBytesTractor(
        operatorPasteInstr,
        operatorData,
        calls[pasteCallIndex].callData
    );
}
```

**Issue:** Operators can inject data into blueprint calldata positions defined by `operatorPasteInstrs`. If a publisher creates a blueprint with:
- Incorrectly bounded paste instructions
- Sensitive data positions exposed to operators

An operator could potentially:
- Modify recipient addresses
- Change amounts
- Inject malicious calldata

**Status:** Needs analysis of `LibBytes.pasteBytesTractor` bounds checking

---

#### 3. sendTokenToInternalBalance - Operator Fund Drain
**File:** `contracts/beanstalk/facets/farm/TractorFacet.sol`

```solidity
/**
 * @notice Transfers a token from `msg.sender` to a `recipient` from the External balance.
 * @dev When any function is called via Tractor (e.g., from a blueprint), the protocol substitutes
 * the blueprint publisher as the sender instead of the actual caller.
 *
 * Tractor operators should be cautious when using this function, as it may result in
 * funds being withdrawn from their wallet.
 */
function sendTokenToInternalBalance(
    IERC20 token,
    address recipient,
    uint256 amount
) external payable fundsSafu noSupplyChange noOutFlow nonReentrant {
    LibTransfer.transferToken(
        token,
        msg.sender,  // <-- msg.sender is the OPERATOR, not publisher!
        recipient,
        amount,
        LibTransfer.From.EXTERNAL,
        LibTransfer.To.INTERNAL
    );
}
```

**Issue:** This function explicitly uses `msg.sender` (operator) instead of `LibTractor._user()` (publisher). A malicious blueprint could include a call to this function to drain an operator's approved tokens.

**Attack Vector:**
1. Malicious publisher creates blueprint with `sendTokenToInternalBalance` call
2. Blueprint appears benign but includes hidden call
3. Unsuspecting operator executes blueprint
4. Operator's approved tokens are transferred to attacker

**Mitigation exists:** Protocol warns operators to check for selector `0xca1e71ae` in bytecode

**Status:** ⚠️ Design intentional but risky - edge case for operator education

---

### 🟠 HIGH - Price Manipulation Concerns

#### 4. PriceManipulation Oracle Sync Attack
**File:** `contracts/ecosystem/tractor/utils/PriceManipulation.sol`

```solidity
function isValidSlippage(IWell well, uint256 slippageRatio) external returns (bool) {
    // Call sync on well to update pump data and avoid stale reserves.
    well.sync(address(protocol), 0);  // <-- External call to Well
    
    uint256[] memory currentReserves = well.getReserves();
    // ... price comparison logic
}
```

**Issue:** The `sync()` call updates pump data before price check. In the same transaction:
1. Attacker manipulates Well reserves
2. Calls function that triggers `isValidSlippage`
3. `sync()` updates pump with manipulated data
4. EMA check passes because manipulation just happened
5. Attacker profits from price discrepancy

**Status:** Needs deeper analysis of Multi Flow Pump EMA timing

---

#### 5. LibFarm delegatecall to Facets
**File:** `contracts/libraries/LibFarm.sol`

```solidity
function _beanstalkCall(
    address facet,
    bytes memory data
) private returns (bool success, bytes memory result) {
    // Temporarily unlock non-farming reentrancy to allow a single Beanstalk call.
    s.sys.reentrantStatus = C.NOT_ENTERED;
    (success, result) = facet.delegatecall(data);
    s.sys.reentrantStatus = C.ENTERED;
}
```

**Issue:** Reentrancy lock is explicitly disabled during delegatecall. While there's a separate `farmingStatus` lock, this pattern could allow unexpected reentrant behavior if:
- A facet function doesn't properly check both locks
- External callback during delegatecall leads to recursive farm calls

**Status:** Medium risk - need to audit all facet functions for proper lock usage

---

### 🟡 MEDIUM - Other Observations

#### 6. Assembly Blocks Without Overflow Checks
Multiple assembly blocks bypass Solidity's built-in overflow checks:

```
contracts/pipeline/Pipeline.sol:114
contracts/libraries/LibFunction.sol:25
contracts/libraries/LibFarm.sol:57
contracts/libraries/Silo/LibTokenSilo.sol:409
```

**Status:** Need line-by-line audit of each assembly block

#### 7. Invariable Modifier Complexity
The `fundsSafu` modifier iterates through all whitelisted tokens on every write operation. While good for safety, this could:
- Cause DoS if token list grows too large
- Hide bugs if token entitlement calculation has edge cases

---

## Contracts In Scope (Immunefi)

| Address | Name | Status |
|---------|------|--------|
| 0xD1A0D188E861ed9d15773a2F3574a2e94134bA8f | Pinto Protocol (Diamond) | 🔍 Auditing |
| 0x73924B07D9E087b5Cb331c305A65882101bC2fa2 | Shipment Planner | Not yet reviewed |
| 0xBA510990a720725Ab1F9a0D231F045fc906909f4 | Upgradable Well Implementation | Not yet reviewed |
| 0xEEE0001Ba9488B70cf72E8FdFf43AEda68a4203d | Unwrap and Send ETH | Not yet reviewed |
| 0xBA51AAaA66DaB6c236B356ad713f759c206DcB93 | Multi Flow Pump | Not yet reviewed |
| 0xb170000aeeFa790fa61D6e837d1035906839a3c8 | Pinto ERC-20 Token | Not yet reviewed |

---

## Next Steps

1. **Deep dive into LibBytes.pasteBytesTractor** - Verify bounds checking
2. **PoC for Pipeline asset extraction** - Can MEV bots extract residual funds?
3. **Analyze Multi Flow Pump EMA timing** - How fast does EMA update?
4. **Trace all `delegatecall` paths** - Ensure proper lock usage
5. **Manual review of assembly blocks** - Check for overflow/underflow

---

## Tools Used

- Semgrep (`p/smart-contracts`) - 1126 findings (all INFO level)
- Manual code review
- Pattern grep for `delegatecall`, `assembly`, `external payable`

---

## Appendix: File Structure

```
contracts/
├── beanstalk/
│   ├── facets/          # Diamond facets (Silo, Field, Farm, Token, etc.)
│   ├── init/            # Initialization contracts
│   └── Invariable.sol   # Safety modifiers
├── ecosystem/
│   ├── tractor/         # Blueprint system
│   │   ├── blueprints/  # ConvertUp, Sow blueprints
│   │   └── utils/       # Helpers, PriceManipulation
│   ├── price/           # BeanstalkPrice, WellPrice
│   └── junction/        # Logic/Math junctions
├── pipeline/            # External call sandbox
└── libraries/           # Shared libraries
```

---

*Report generated by Patrick Collins 🛡️ - Trail of Bits methodology*
