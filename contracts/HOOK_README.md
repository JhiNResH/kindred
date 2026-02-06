# KindredHook - Reputation-Based Dynamic Fees

## Overview

KindredHook is a Uniswap v4 Hook that implements **dynamic swap fees based on user reputation**. Users who build reputation in the Kindred ecosystem get lower trading fees as a reward for their contributions.

## ✨ Features

- **3-Tier Dynamic Fee System:**
  - High Trust (≥850): 0.15% swap fee
  - Medium Trust (600-849): 0.22% swap fee
  - Low Trust (<600): 0.30% swap fee

- **Reputation-Based Access Control:**
  - Minimum score of 100 required to trade
  - Blocked accounts cannot trade
  - Oracle-based score validation

- **Safety & Security:**
  - Pausable by owner (emergency stop)
  - Graceful oracle failure handling (fallback to highest fee)
  - Comprehensive error handling
  - 22 tests covering all edge cases

## 🏗️ Architecture

```
┌─────────────────┐
│  Uniswap v4     │
│  Pool Manager   │
└────────┬────────┘
         │
         │ beforeSwap()
         │ afterSwap()
         ▼
┌─────────────────┐      ┌──────────────────┐
│  KindredHook    │─────▶│ ReputationOracle │
│                 │      │                  │
│ - beforeSwap()  │      │ - getScore()     │
│ - afterSwap()   │      │ - isBlocked()    │
│ - calculateFee()│      │ - setScore()     │
└─────────────────┘      └──────────────────┘
```

## 🧪 Test Results

**All 22 tests passing ✅**

```bash
cd contracts && forge test --match-contract KindredHookTest -vv
```

### Test Coverage

1. **Fee Calculation (3 tests)**
   - `test_CalculateFee_AllTiers` - All fee tiers (15, 22, 30 bp)
   - `test_GetFeeForAccount` - Account-specific fee lookup
   - Fuzz tests for monotonicity and valid scores

2. **Trade Validation (3 tests)**
   - `test_CanTrade` - Access control checks
   - `test_ValidateTrade_Success` - Valid trades
   - `test_ValidateTrade_RevertBlocked` - Blocked account rejection
   - `test_ValidateTrade_RevertLowScore` - Low score rejection

3. **Hook Callbacks (4 tests)**
   - `test_BeforeSwap_Success` - Normal swap flow
   - `test_BeforeSwap_WithHookData` - Router integration
   - `test_BeforeSwap_RevertBlocked` - Blocked user rejection
   - `test_BeforeSwap_RevertLowScore` - Low reputation rejection
   - `test_AfterSwap` - Post-swap callback

4. **Admin Controls (3 tests)**
   - `test_Pause` - Emergency pause
   - `test_Unpause` - Resume operation
   - `test_Pause_OnlyOwner` - Access control

5. **Integration Tests (2 tests)**
   - `test_Integration_ReputationUpgrade` - Score changes affect fees
   - `test_Integration_FullSwapFlow` - End-to-end swap

6. **Fuzz Tests (3 tests)**
   - `testFuzz_CalculateFee_Valid` - Fee range validation
   - `testFuzz_FeeMonotonicity` - Higher score = lower fee
   - `testFuzz_BeforeSwap_ValidScores` - Random score handling

7. **Constructor Tests (2 tests)**
   - `test_Constructor_RevertsOnZeroOracle`
   - `test_Constructor_RevertsOnZeroPoolManager`

## 🚀 Deployment

### Prerequisites

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export BASE_SEPOLIA_RPC=https://sepolia.base.org
```

### Deploy Script

```bash
cd contracts

# Deploy KindredHook + ReputationOracle + MockPoolManager
forge script script/DeployHook.s.sol:DeployHookScript \
  --rpc-url $BASE_SEPOLIA_RPC \
  --broadcast \
  --verify
```

### What Gets Deployed

1. **ReputationOracle** - Stores user reputation scores
2. **MockPoolManager** - Minimal mock for demo (replace with real Uniswap v4 in production)
3. **KindredHook** - Dynamic fee hook

### Post-Deployment

After deployment, update `src/lib/contracts.ts`:

```typescript
export const CONTRACTS = {
  // ... existing contracts
  REPUTATION_ORACLE: "0x..." as `0x${string}`,
  KINDRED_HOOK: "0x..." as `0x${string}`,
  POOL_MANAGER: "0x..." as `0x${string}`,
};
```

## 🎨 Frontend Demo

A live demo page is available at `/hook-demo`:

- **Interactive slider** - Adjust reputation score
- **Real-time fee calculation** - See how fees change
- **Fee tier visualization** - Understand the 3-tier system
- **Educational content** - Learn how it works

## 📝 Smart Contract Interface

### Core Functions

```solidity
/// @notice Calculate fee for a swap (called by Uniswap v4)
function beforeSwap(
    address sender,
    bytes calldata key,
    bytes calldata hookData
) external returns (bytes4 selector, uint24 fee);

/// @notice Get fee for a specific account
function getFeeForAccount(address account) external view returns (uint24);

/// @notice Check if account can trade
function canTrade(address account) external view returns (bool);

/// @notice Calculate fee from reputation score
function calculateFee(uint256 score) external pure returns (uint24);
```

### Fee Tiers (Constants)

```solidity
uint24 public constant FEE_HIGH_TRUST = 15;    // 0.15% (score >= 850)
uint24 public constant FEE_MEDIUM_TRUST = 22;  // 0.22% (score >= 600)
uint24 public constant FEE_LOW_TRUST = 30;     // 0.30% (score < 600)

uint256 public constant HIGH_TRUST_THRESHOLD = 850;
uint256 public constant MEDIUM_TRUST_THRESHOLD = 600;
uint256 public constant MIN_SCORE_TO_TRADE = 100;
```

## 🔐 Security Features

1. **Oracle Failure Handling:**
   - If oracle fails, fallback to highest fee (fail-safe)
   - Prevents trading halt due to oracle issues

2. **Access Control:**
   - Blocked accounts cannot trade (hard block)
   - Minimum score requirement (soft gate)
   - Owner can pause in emergency

3. **Event Logging:**
   - `SwapWithReputation` - Every successful swap
   - `TradeBlocked` - Every blocked trade attempt

## 📊 Gas Benchmarks

| Function | Gas Cost |
|----------|----------|
| beforeSwap (no hookData) | ~27,000 |
| beforeSwap (with hookData) | ~27,600 |
| afterSwap | ~8,700 |
| calculateFee | ~5,900 |

## 🎯 Roadmap

### MVP (Current)
- ✅ 3-tier fee system
- ✅ Reputation oracle integration
- ✅ Comprehensive tests
- ✅ Mock deployment script

### V2 (Post-Hackathon)
- [ ] Real Uniswap v4 integration (when available on Base)
- [ ] Multi-pool support
- [ ] Gradual fee curves (not just 3 tiers)
- [ ] Time-weighted reputation scores
- [ ] Cross-chain reputation sync

## 📚 References

- [Uniswap v4 Hooks](https://github.com/Uniswap/v4-periphery)
- [KindredComment NFT System](./src/KindredComment.sol)
- [ReputationOracle](./src/ReputationOracle.sol)

## 🏆 Hackathon Submission

**Built for:** Clawathon (Feb 2026)

**Key Innovation:** First implementation of reputation-based dynamic fees on Uniswap v4, creating a direct incentive for quality contributions to the Kindred ecosystem.

**Impact:** Users who build reputation through quality reviews and accurate predictions get rewarded with lower trading fees, aligning incentives between the social layer and DeFi layer.
