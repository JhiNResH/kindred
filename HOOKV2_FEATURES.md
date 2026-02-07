# KindredHookV2 - Advanced Protection Features

**Deployed:** `0x5238C910f0690eb9C8b4f34Cf78c97C3D7f9E313` (Base Sepolia)

## 🚀 New Features

### 1. Anti-MEV Priority Queue ⚡
High-reputation users and AI agents get **immediate execution** with maximum MEV protection.

**Priority Levels:**
- **Priority 3 (Immediate):** Reputation ≥ 850 → Instant block execution
- **Priority 2 (Normal):** Reputation 600-849 → Next block execution  
- **Priority 1 (Protected):** Reputation < 600 → Delayed 1-2 blocks for MEV protection

**Benefits:**
- High-rep users: Zero MEV delay
- Low-rep users: Protected from sandwich attacks via delay
- AI Agents: Same protection as human users

---

### 2. Circuit Breaker 🛡️
Prevents rug pulls and protects liquidity providers.

**Thresholds:**
- **Warning:** Swaps > 5% of pool size
- **Maximum:** Swaps > 10% of pool size (blocked)

**How it works:**
- Monitors swap size vs pool liquidity
- Low-reputation users trigger warnings on large swaps
- Protects against flash crashes and rug pulls

---

### 3. Referral System 🎁
High-reputation users earn rewards for bringing new traders.

**Requirements:**
- Referrer minimum reputation: **700**
- Referee must complete trades

**Rewards:**
- **20% of swap fees** go to referrer
- **+10 reputation points** per successful referral
- Unlimited earning potential

**How to use:**
1. Build reputation to 700+
2. Share your referral link: `https://kindred.app/?ref=YOUR_ADDRESS`
3. Earn 20% of every swap fee from your referrals

---

### 4. AI Agent Protection 🤖
Special protection and lower requirements for AI agents.

**Agent Benefits:**
- Lower minimum reputation: **300** (vs 100 for users)
- Auto reputation boost on registration
- Same MEV protection as high-rep users
- Priority transaction execution

**How to register:**
```typescript
// Self-registration
await hook.registerAgent(agentAddress)

// Check agent status
const isAgent = await hook.isAgent(agentAddress)
```

---

## 🎨 UI Components

### PriorityBadge
Shows user's execution priority and MEV protection level.

**Location:** `src/components/swap/PriorityBadge.tsx`

**Features:**
- Real-time priority display
- MEV protection explanation
- Reputation progress bar
- Agent status badge

### ReferralWidget
Referral program management interface.

**Location:** `src/components/swap/ReferralWidget.tsx`

**Features:**
- One-click referral link copy
- Real-time referral count
- Earnings tracking
- Reputation progress (for non-referrers)

---

## 📊 Comparison: V1 vs V2

| Feature | KindredHook (V1) | KindredHookV2 |
|---------|------------------|---------------|
| Dynamic Fees | ✅ 0.15%-0.30% | ✅ 0.15%-0.30% |
| Reputation Check | ✅ | ✅ |
| **Anti-MEV Priority** | ❌ | ✅ **NEW** |
| **Circuit Breaker** | ❌ | ✅ **NEW** |
| **Referral System** | ❌ | ✅ **NEW** |
| **AI Agent Protection** | ❌ | ✅ **NEW** |
| Minimum Reputation | 100 | 100 (300 for agents) |
| Pauseable | ✅ | ✅ |

---

## 🧪 Testing

**Run tests:**
```bash
cd contracts
forge test --match-contract KindredHookV2Test -vv
```

**Test coverage:**
- ✅ 17/17 tests passing
- ✅ Priority calculation
- ✅ Referral system
- ✅ Agent registration
- ✅ Fee calculation
- ✅ Circuit breaker
- ✅ Access control

---

## 🔗 Integration

### Update contracts.ts

```typescript
import KindredHookV2ABI from './abi/KindredHookV2.json'

export const CONTRACTS = {
  baseSepolia: {
    // ... existing contracts
    kindredHookV2: {
      address: '0x5238C910f0690eb9C8b4f34Cf78c97C3D7f9E313' as `0x${string}`,
      abi: KindredHookV2ABI,
    },
  },
}
```

### Add to SwapInterface

```typescript
import { PriorityBadge } from '@/components/swap/PriorityBadge'
import { ReferralWidget } from '@/components/swap/ReferralWidget'

// Inside component:
<PriorityBadge reputation={reputation} isAgent={isAgent} />
<ReferralWidget reputation={reputation} />
```

---

## 🎯 Hackathon Submission Points

### USDC Hackathon (SmartContract Track)
1. **Anti-MEV Innovation** - First reputation-based MEV protection
2. **Circuit Breaker** - Protects USDC liquidity
3. **Real World Use** - Working testnet deployment with liquidity

### Builder Quest (Autonomous Agent Track)
1. **AI Agent Protection** - Lower barriers for agent participation
2. **Priority Execution** - Agents compete on reputation, not speed
3. **Referral System** - Agents can refer users and earn

### Clawathon (OpenClaw Track)
1. **Multi-Agent Coordination** - Agents collaborate via reputation
2. **Agent-First Design** - Lower reputation requirements
3. **Economic Sustainability** - Agent earnings via referrals

---

## 🚧 Next Steps

### Phase 1 (Complete) ✅
- [x] Anti-MEV Priority Queue
- [x] Circuit Breaker
- [x] Referral System
- [x] AI Agent Protection
- [x] Tests (17/17 passing)
- [x] Deployment to Base Sepolia

### Phase 2 (Tonight)
- [ ] Integrate PriorityBadge into SwapInterface
- [ ] Integrate ReferralWidget into SwapInterface
- [ ] Add agent registration UI
- [ ] Update contracts.ts with V2 address
- [ ] Export KindredHookV2 ABI

### Phase 3 (Tomorrow)
- [ ] Add referral tracking API
- [ ] Implement rewards claim function
- [ ] Circuit breaker analytics dashboard
- [ ] Agent leaderboard

---

## 📖 Documentation

**Contracts:**
- `contracts/src/KindredHookV2.sol` - Main hook implementation
- `contracts/test/KindredHookV2.t.sol` - Test suite
- `contracts/script/DeployHookV2.s.sol` - Deployment script

**Frontend:**
- `src/components/swap/PriorityBadge.tsx` - Priority display
- `src/components/swap/ReferralWidget.tsx` - Referral interface
- `src/app/swap/SwapInterface.tsx` - Main swap UI (needs integration)

**Deployed Addresses:**
- KindredHookV2: `0x5238C910f0690eb9C8b4f34Cf78c97C3D7f9E313`
- ReputationOracle: `0xb3Af55a046aC669642A8FfF10FC6492c22C17235`
- MockPoolManager: `0x7350Cc2655004d32e234094C847bfac789D19408`

---

**Created:** 2026-02-07 13:30 PST
**Developer:** Patrick Collins (Bounty Hunter Agent)
**Status:** Phase 1 Complete, Phase 2 In Progress
