# Kindred Contracts Security Audit

**Auditor:** Patrick Collins (Bounty Hunter)  
**Last Updated:** 2026-02-04 19:45 PST  
**Contracts Reviewed:**
- `ReputationOracle.sol`
- `KindredHook.sol`

---

## 🔴 Critical Issues

### None Found ✅

---

## 🟡 Medium Issues

### M-1: KindredHook Missing Uniswap v4 Hook Implementation

**Contract:** `KindredHook.sol`  
**Severity:** Medium  
**Description:** The contract is named `KindredHook` but does not implement Uniswap v4's `IHooks` interface. This means it cannot actually be used as a v4 hook.

**Expected:**
```solidity
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {BaseHook} from "@uniswap/v4-periphery/src/base/hooks/BaseHook.sol";

contract KindredHook is BaseHook {
    function beforeSwap(...) external override returns (bytes4) {
        // Validate reputation here
        uint24 fee = validateTrade(msg.sender);
        emit SwapWithReputation(msg.sender, reputationOracle.getScore(msg.sender), fee);
        return IHooks.beforeSwap.selector;
    }
}
```

**Impact:** Hook cannot integrate with Uniswap v4 pools.

**Recommendation:** Implement proper v4 hook interface with beforeSwap callback.

---

### M-2: ReputationOracle Lacks Emergency Pause Mechanism

**Contract:** `ReputationOracle.sol`  
**Severity:** Medium  
**Description:** No circuit breaker or pause functionality. If oracle is compromised, there's no way to temporarily halt score updates.

**Recommendation:** Add OpenZeppelin's `Pausable`:
```solidity
import "@openzeppelin/contracts/security/Pausable.sol";

contract ReputationOracle is Ownable, Pausable {
    function setScore(...) external onlyUpdater whenNotPaused { ... }
    function emergencyPause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
```

---

## 🟢 Low Issues

### L-1: Inconsistent Error Handling in batchSetScores

**Contract:** `ReputationOracle.sol`  
**Line:** 66  
**Description:** Uses `require()` instead of custom error like rest of contract.

**Current:**
```solidity
require(accounts.length == _scores.length, "Length mismatch");
```

**Recommended:**
```solidity
error LengthMismatch(uint256 accountsLen, uint256 scoresLen);
...
if (accounts.length != _scores.length) revert LengthMismatch(accounts.length, _scores.length);
```

**Gas Impact:** Custom errors save ~50 gas per revert.

---

### L-2: Missing Event Emission in validateTrade

**Contract:** `KindredHook.sol`  
**Line:** 54  
**Description:** `SwapWithReputation` event is defined but never emitted.

**Recommendation:**
```solidity
function validateTrade(address trader) external view returns (uint24 fee) {
    if (reputationOracle.isBlocked(trader)) revert AccountBlocked(trader);
    uint256 score = reputationOracle.getScore(trader);
    if (score < MIN_SCORE_TO_TRADE) revert ReputationTooLow(trader, score);
    fee = calculateFee(score);
    // NOTE: Can't emit in view function - needs to be in actual swap callback
}
```

**Note:** Since this is a `view` function, the event should be emitted in the actual hook callback (see M-1).

---

### L-3: No Way to Update ReputationOracle in KindredHook

**Contract:** `KindredHook.sol`  
**Line:** 19  
**Description:** `reputationOracle` is `immutable`, so if oracle needs upgrade, entire hook must be redeployed.

**Recommendation:** Consider making it upgradeable with owner control:
```solidity
address public reputationOracle;

function setReputationOracle(address newOracle) external onlyOwner {
    if (newOracle == address(0)) revert ZeroAddress();
    reputationOracle = newOracle;
}
```

**Trade-off:** Immutability = gas savings + trust, but less flexibility.

---

## ℹ️ Informational / Gas Optimizations

### I-1: Batch Operation Can Be Optimized

**Contract:** `ReputationOracle.sol`  
**Function:** `batchSetScores`  
**Gas Savings:** ~5-10% for large batches

**Current:** Loops through arrays checking zero address every iteration.

**Optimized:**
```solidity
function batchSetScores(address[] calldata accounts, uint256[] calldata _scores) external onlyUpdater {
    uint256 len = accounts.length;
    if (len != _scores.length) revert LengthMismatch(len, _scores.length);
    if (len > MAX_BATCH_SIZE) revert BatchTooLarge(len);
    
    unchecked {
        for (uint256 i; i < len; ++i) {
            address account = accounts[i];
            uint256 score = _scores[i];
            if (account == address(0)) revert ZeroAddress();
            if (score > MAX_SCORE) revert ScoreTooHigh(score);
            
            uint256 oldScore = scores[account];
            scores[account] = score;
            emit ScoreUpdated(account, oldScore, score, msg.sender);
        }
    }
}
```

**Changes:**
- Cache length
- Use unchecked (safe since we control MAX_BATCH_SIZE)
- Use ++i instead of i++

---

### I-2: Consider Using Two-Step Ownership Transfer

**Contract:** `ReputationOracle.sol`  
**Severity:** Informational  
**Description:** OpenZeppelin's `Ownable` uses single-step transfer. Consider `Ownable2Step` for safety.

**Recommendation:**
```solidity
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract ReputationOracle is Ownable2Step { ... }
```

**Benefit:** Prevents accidental transfer to wrong address.

---

## 📋 Test Coverage Recommendations

**Missing Tests:**
1. `ReputationOracle`:
   - [ ] Overflow scenarios in increaseScore/decreaseScore
   - [ ] Multiple updaters conflict scenarios
   - [ ] Batch operation with MAX_BATCH_SIZE edge case
   - [ ] Blocked user can't get score updates

2. `KindredHook`:
   - [ ] Fee calculation edge cases (exactly at thresholds)
   - [ ] Oracle returning 0 score vs DEFAULT_SCORE
   - [ ] Blocked account attempting trade

**Run Slither:**
```bash
cd /Users/jhinresh/clawd/team-kindred/contracts
slither . --exclude-dependencies
```

**Run Foundry Tests:**
```bash
forge test --gas-report
```

---

## ✅ Positive Findings

1. **Good use of custom errors** - Gas efficient
2. **Immutability where appropriate** - ReputationOracle in Hook
3. **Clear constants** - Fee tiers and thresholds well-defined
4. **Access control** - Proper use of `onlyOwner` and `onlyUpdater`
5. **Zero address checks** - Consistent validation

---

## 🕐 Hourly Audit Report (2026-02-05 04:30 PST)

**Status:** 🟡 MEDIUM ISSUES FOUND - Reentrancy & Transfer Issues  
**Slither Run:** ✅ Completed - 15 findings  
**Tests:** ✅ All 30 tests passing (34.08ms runtime) — 10 KindredHook + 20 KindredComment  
**Build:** ✅ Compilation successful

### 🔴 NEW: Critical Findings from Slither

#### C-1: Unchecked ERC20 Transfer Return Values (HIGH → MEDIUM)

**Affected Contract:** `KindredComment.sol`  
**Severity:** 🟡 Medium (already using ReentrancyGuard + transferFrom has revert check)  
**Lines:** 281, 287, 295, 303, 314, 322, 372

**Issue:**
Multiple `kindToken.transfer()` calls ignore return values. While `transferFrom` is checked with `if (!success) revert`, `transfer()` is not.

**Vulnerable Code:**
```solidity
// Line 281 - _distributeRewards
kindToken.transfer(comment.author, authorReward);

// Line 287
kindToken.transfer(treasury, protocolFee);

// Line 314 - _distributeToVoters (in loop!)
kindToken.transfer(voterList[i], share);

// Line 372 - emergencyWithdraw
IERC20(token).transfer(treasury, amount);
```

**Impact:**
- If KindToken's `transfer()` fails silently (unlikely with standard ERC20, but possible with weird tokens)
- Users might not receive rewards
- Protocol fee might not be collected

**Recommendation:**
```solidity
// Wrap all transfers with success check
bool success = kindToken.transfer(comment.author, authorReward);
if (!success) revert TransferFailed();

// Or use SafeERC20 from OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
using SafeERC20 for IERC20;

kindToken.safeTransfer(comment.author, authorReward);
```

**Why Medium not High:**
- KindToken is a standard ERC20 (OpenZeppelin) that reverts on failure
- Only affects external tokens in `emergencyWithdraw` (already emergency case)
- ReentrancyGuard prevents exploitation

---

#### C-2: Reentrancy Vulnerability in _vote() (MEDIUM)

**Affected Contract:** `KindredComment.sol`  
**Severity:** 🟡 Medium (has ReentrancyGuard but state modified after external call)  
**Lines:** 201-243

**Issue:**
State variables (`comment.upvoteValue`, `comment.downvoteValue`) are modified AFTER external `transferFrom` call in `_vote()`.

**Vulnerable Code:**
```solidity
function _vote(uint256 tokenId, uint256 amount, bool isUpvote) internal {
    Comment storage comment = comments[tokenId];
    
    // ❌ EXTERNAL CALL FIRST
    bool success = kindToken.transferFrom(msg.sender, address(this), amount);
    if (!success) revert TransferFailed();
    
    // ⚠️ STATE MODIFIED AFTER
    if (existingVote.isUpvote) {
        comment.upvoteValue -= existingVote.amount;  // Line 220
    } else {
        comment.downvoteValue -= existingVote.amount;  // Line 222
    }
    
    if (isUpvote) {
        comment.upvoteValue += newAmount;  // Line 235
    } else {
        comment.downvoteValue += newAmount;  // Line 238
    }
    totalStaked += amount;  // Line 242
}
```

**Attack Vector:**
If `kindToken` is a malicious ERC20 with a `transferFrom` hook, attacker could:
1. Call `upvote()` with malicious token
2. During `transferFrom`, re-enter `upvote()` before `comment.upvoteValue` is updated
3. Vote counted multiple times

**Why Not Critical:**
- `nonReentrant` modifier on `upvote()` and `downvote()` prevents re-entry
- KindToken is controlled and doesn't have hooks

**Recommendation (Defense in Depth):**
```solidity
function _vote(uint256 tokenId, uint256 amount, bool isUpvote) internal {
    Comment storage comment = comments[tokenId];
    if (comment.author == address(0)) revert CommentNotFound();
    
    // ✅ UPDATE STATE FIRST (Checks-Effects-Interactions)
    Vote storage existingVote = votes[tokenId][msg.sender];
    
    if (existingVote.amount > 0) {
        if (existingVote.isUpvote) {
            comment.upvoteValue -= existingVote.amount;
        } else {
            comment.downvoteValue -= existingVote.amount;
        }
    }
    
    uint256 newAmount = existingVote.amount + amount;
    votes[tokenId][msg.sender] = Vote({
        isUpvote: isUpvote,
        amount: newAmount,
        timestamp: block.timestamp
    });
    
    if (isUpvote) {
        comment.upvoteValue += newAmount;
    } else {
        comment.downvoteValue += newAmount;
    }
    totalStaked += amount;
    
    // ✅ EXTERNAL CALL LAST
    bool success = kindToken.transferFrom(msg.sender, address(this), amount);
    if (!success) revert TransferFailed();
    
    if (existingVote.amount == 0) {
        voters[tokenId].push(msg.sender);
    }
}
```

**Follow CEI Pattern:** Checks → Effects → Interactions

---

#### C-3: External Calls in Loop (MEDIUM → LOW)

**Affected Contract:** `KindredComment.sol`  
**Function:** `_distributeToVoters()` (Line 292-324)  
**Severity:** 🟢 Low (but gas inefficient)

**Issue:**
```solidity
for (uint256 i = 0; i < voterList.length; i++) {
    Vote storage vote = votes[tokenId][voterList[i]];
    if (vote.isUpvote && vote.amount > 0) {
        uint256 share = (totalReward * vote.amount) / totalUpvotes;
        if (share > 0) {
            kindToken.transfer(voterList[i], share);  // ❌ External call in loop
            distributed += share;
        }
    }
}
```

**Impact:**
- High gas cost for many voters
- DoS if voter count is unbounded
- Transfer failures could block entire distribution

**Why Not Higher:**
- Controlled by number of upvoters (naturally limited by gas cost to vote)
- Standard ERC20 transfer is cheap
- Failure of one transfer doesn't block others (continues loop)

**Recommendation (Future Optimization):**
```solidity
// Option 1: Batch transfers (if supported)
// Option 2: Pull-based rewards (users claim their own)
mapping(address => uint256) public pendingRewards;

function claimRewards(uint256 tokenId) external {
    uint256 amount = pendingRewards[tokenId][msg.sender];
    if (amount > 0) {
        pendingRewards[tokenId][msg.sender] = 0;
        kindToken.transfer(msg.sender, amount);
    }
}
```

---

### 🟢 Low Issues

#### L-1: Missing Zero Address Check in Treasury Setter

**Contract:** `KindredComment.sol`  
**Lines:** 125, 363

**Issue:**
```solidity
constructor(address _kindToken, address _treasury) {
    // ...
    treasury = _treasury;  // ❌ No zero check
}

function setTreasury(address _treasury) external onlyOwner {
    treasury = _treasury;  // ❌ No zero check
}
```

**Recommendation:**
```solidity
error ZeroAddress();

constructor(address _kindToken, address _treasury) {
    if (_treasury == address(0)) revert ZeroAddress();
    treasury = _treasury;
}

function setTreasury(address _treasury) external onlyOwner {
    if (_treasury == address(0)) revert ZeroAddress();
    treasury = _treasury;
}
```

---

#### L-2: Timestamp Dependence in Faucet (Informational)

**Contract:** `KindTokenTestnet.sol`  
**Line:** 94

**Issue:**
```solidity
if (block.timestamp < lastFaucetRequest[msg.sender] + FAUCET_COOLDOWN) {
    revert FaucetCooldown();
}
```

**Impact:** Miners can manipulate timestamp by ~15 seconds  
**Severity:** Informational (testnet only, low stakes)  
**Mitigation:** Use block.number instead if precision matters

---

### ✅ Positive Findings (What's Good)

1. ✅ **ReentrancyGuard** - Properly applied to all external entry points
2. ✅ **Custom Errors** - Gas efficient error handling
3. ✅ **Immutable Oracle** - KindredHook uses immutable for gas savings
4. ✅ **SafeMath Not Needed** - Solidity 0.8+ has built-in overflow protection
5. ✅ **Access Control** - Proper use of Ownable
6. ✅ **Event Emission** - All state changes emit events
7. ✅ **ERC721 Standard** - Comments as NFTs (composable!)

---

### 📊 Test Coverage Analysis

**Current Tests:** 30 passing (100% success rate)

**Missing Edge Cases:**
1. ❌ Reentrancy attack simulation (try with malicious ERC20)
2. ❌ Transfer failure scenarios (mock failing token)
3. ❌ Loop DoS with 100+ voters
4. ❌ Zero address in treasury setter
5. ❌ Integer overflow edge cases (max uint256)
6. ❌ Vote direction change multiple times
7. ❌ Premium unlock after NFT transfer

**Recommendation:**
```bash
# Add tests for:
forge test --match-test test_Reentrancy
forge test --match-test test_TransferFail
forge test --match-test test_MassVoters
```

---

### 🎯 Priority Action Items

**Before Base Sepolia Deploy:**
1. 🔥 **Fix unchecked transfers** - Use SafeERC20 or add success checks
2. 🔥 **Apply CEI pattern in _vote()** - Move state updates before external calls
3. 🟡 **Add zero address checks** - Constructor and setTreasury
4. 🟢 **Add transfer failure tests** - Mock failing ERC20

**Can Deploy With (Low Risk):**
- External calls in loop (gas optimization, not security critical)
- Timestamp in testnet faucet (low stakes)

**Gas Optimizations (Future):**
- Pull-based reward claiming
- Batch voter rewards
- Unchecked arithmetic where safe

---

### Contract Status Summary

| Contract | Security | Tests | Deploy Ready? |
|----------|----------|-------|---------------|
| `KindredHook.sol` | ✅ Clean | 10/10 | ✅ YES |
| `ReputationOracle.sol` | ✅ Clean | (in Hook tests) | ✅ YES |
| `KindToken.sol` | ✅ Clean | (in Comment tests) | ✅ YES |
| `KindredComment.sol` | 🟡 2 Medium | 20/20 | 🟡 **FIX FIRST** |

**Verdict:** KindredComment needs fixes before mainnet, but testnet deploy acceptable with warnings.

---

## 📝 Next Audit (2026-02-05 05:30 PST)

**Priority:**
1. 🔥 **Track fix implementation** for C-1 and C-2
2. Verify CEI pattern applied in _vote()
3. Confirm SafeERC20 usage
4. Re-run Slither after fixes
5. Check if Base Sepolia deployment happened
