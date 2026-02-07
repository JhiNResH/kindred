# Phase 2 Testing Guide - Full UI Integration

**Status:** ✅ Ready for Testing
**Time:** 2026-02-07 13:35 PST

---

## 🎯 What to Test

### 1. Swap Page (http://localhost:3000/swap)

**New Features:**
- ✅ **PriorityBadge** - Shows execution priority (1-3) based on reputation
- ✅ **ReferralWidget** - Displays referral link and earnings
- ✅ **3-Column Layout** - Info cards + Swap interface + Details

**Test Steps:**
```bash
1. Visit http://localhost:3000/swap
2. Connect wallet
3. Check Priority Badge:
   - High rep (≥850) = Priority 3 (Immediate)
   - Medium rep (600-849) = Priority 2 (Normal)
   - Low rep (<600) = Priority 1 (Protected)
4. Check Referral Widget:
   - If rep < 700: Shows progress bar
   - If rep ≥ 700: Shows referral link + copy button
5. Test swap:
   - Enter ETH amount
   - See real-time USDC output
   - Click "Swap" button
   - Confirm transaction
```

---

### 2. Agent Registration (http://localhost:3000/agent)

**New Features:**
- ✅ **Agent Status Check** - Shows if already registered
- ✅ **One-Click Registration** - Register as AI agent
- ✅ **Benefits Display** - Shows all agent benefits
- ✅ **Transaction Tracking** - Real-time confirmation

**Test Steps:**
```bash
1. Visit http://localhost:3000/agent
2. Connect wallet
3. Check current status:
   - Reputation score
   - Agent status (registered/not registered)
4. Click "Register as Agent"
5. Confirm transaction in wallet
6. Wait for confirmation (~2-5 seconds)
7. Verify status changes to "Active"
```

---

### 3. Faucet Page (http://localhost:3000/faucet)

**Features:**
- ✅ **KINDCLAW Faucet** - 1000 KINDCLAW per claim
- ✅ **OPENWORK Faucet** - 100 OPENWORK per claim
- ✅ **USDC Faucet** - 10 USDC per claim
- ✅ **24h Cooldown** - Prevents spam

**Test Steps:**
```bash
1. Visit http://localhost:3000/faucet
2. Connect wallet
3. Click "Claim" on KINDCLAW
4. Confirm transaction
5. Wait for confirmation
6. Check wallet balance (should increase)
7. Try claiming again (should show cooldown timer)
```

---

## 📊 Expected Behavior

### Priority Levels
| Reputation | Priority | Description |
|------------|----------|-------------|
| ≥850 | 3 (Immediate) | Instant execution, zero MEV delay |
| 600-849 | 2 (Normal) | Next block execution |
| <600 | 1 (Protected) | Delayed 1-2 blocks for MEV protection |

### Referral Requirements
| Reputation | Status |
|------------|--------|
| <700 | Not eligible - shows progress bar |
| ≥700 | Eligible - shows referral link |

### Agent Requirements
| User Type | Min Reputation |
|-----------|----------------|
| Standard User | 100 |
| AI Agent | 300 |

---

## 🔍 What to Look For

### ✅ Good Signs
- Priority badge animates smoothly
- Referral link copies with one click
- Swap calculates output in real-time
- Agent registration completes in <10 seconds
- All balances display correctly
- Transaction hashes link to Basescan

### ❌ Red Flags
- Priority badge doesn't update after reputation change
- Referral link is empty or broken
- Swap button disabled when it shouldn't be
- Agent registration transaction fails
- Page crashes or shows errors
- Balances show "undefined" or "NaN"

---

## 🐛 Known Issues

### None (yet!)
Phase 2 is fresh code. Report any issues you find.

---

## 📝 Test Checklist

**Swap Page:**
- [ ] Priority badge displays correct level
- [ ] Reputation score loads from API
- [ ] Referral widget shows for high-rep users
- [ ] Swap calculation is accurate
- [ ] Swap executes successfully
- [ ] Transaction hash links work

**Agent Page:**
- [ ] Status check works
- [ ] Registration button functions
- [ ] Transaction confirmation shows
- [ ] Status updates after registration
- [ ] Benefits grid displays correctly

**Faucet Page:**
- [ ] All 3 faucets work
- [ ] Cooldown prevents spam
- [ ] Balances update after claim
- [ ] Transaction tracking works

---

## 🚀 Next Phase (Phase 3)

After testing Phase 2:
1. Add referral tracking API
2. Implement rewards claim function
3. Circuit breaker analytics dashboard
4. Agent leaderboard
5. Demo video recording

---

## 🔗 Deployed Contracts

**Base Sepolia:**
- KindredHookV2: `0x5238C910f0690eb9C8b4f34Cf78c97C3D7f9E313`
- SimpleSwap: `0x2b50678df7FDb8Baba5867DC5de4F05432CbEf71`
- ReputationOracle: `0xb3Af55a046aC669642A8FfF10FC6492c22C17235`
- USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

---

**Created:** 2026-02-07 13:35 PST
**Developer:** Patrick Collins (Bounty Hunter Agent)
**Status:** Phase 2 Complete ✅
