---
name: kindred-hookathon
description: This skill should be used when the user asks about "Kindred project", "Hookathon", "prediction market DeFi", "v4 Hook development", "Polymarket integration", "預測市場借貸", "虎克船長", or needs guidance on the Kindred prediction market aggregator/lending protocol built on Uniswap v4.
version: 0.1.0
---

# Kindred - Prediction Market DeFi Layer

## 🪝 Agent 資訊

**Agent ID:** captain-hook
**Bot:** @DriverLamb_bot (暫用)
**accountId:** `captain-hook`
**Topic:** 2412 (虎克船長)

### 參與會議

當夢想家召集會議時，用 message tool 發言到會議廳：
```json
{
  "action": "send",
  "channel": "telegram",
  "accountId": "captain-hook",
  "target": "-1003723685993",
  "threadId": "3979",
  "message": "你的回應"
}
```

**協作資源:** 讀取 `~/clawd/memory/agent-system.md` 了解團隊協作方式。

### 當前決策

**聚合器版 vs 借貸版：** 虎克船長建議聚合器版優先（MVP 快、風險低、更容易拿獎），借貸版留給 Phase 2。等待 JhiNResH 最終拍板。

---

Kindred is a Uniswap v4 Hook project that brings DeFi primitives to prediction markets.

## Product Definition

**Name:** Kindred 🐺
**Tagline:** "預測市場的 Aave" / "DeFi layer for prediction markets"
**Chain:** Polygon (direct Polymarket integration)

### Core Value Proposition

Transform prediction market positions into composable DeFi assets:
- **Before Kindred:** Prediction positions are isolated, can only hold or sell
- **After Kindred:** Positions can be collateralized, borrowed against, leveraged

### Two-Way System

```
┌─────────────────────────────────────────────────────┐
│  🐺 Kindred                                         │
│                                                     │
│  ┌─────────────────┐     ┌─────────────────┐       │
│  │   Feature 1     │     │   Feature 2     │       │
│  │                 │     │                 │       │
│  │  ETH/BTC/Assets │     │ Prediction Pos  │       │
│  │       ↓         │     │   (kYES/kNO)    │       │
│  │   Collateral    │     │       ↓         │       │
│  │       ↓         │     │   Collateral    │       │
│  │ Open Prediction │     │       ↓         │       │
│  │    Position     │     │  Borrow USDC    │       │
│  └─────────────────┘     └─────────────────┘       │
│                                                     │
│      Entry                    Exit                  │
│  (Enter prediction)    (Release liquidity)         │
└─────────────────────────────────────────────────────┘
```

**Feature 1:** Collateralize ETH → Open prediction position (integrate Aave)
**Feature 2:** Collateralize kYES/kNO → Borrow USDC (novel, main innovation)

## Technical Architecture

### Why Polygon?

| Factor | Polygon | Unichain | Base |
|--------|---------|----------|------|
| Uniswap v4 | ✅ | ✅ | ✅ |
| Polymarket | ✅ Direct | ❌ Oracle only | ❌ |
| Liquidity | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Direct Integration | ✅ | ❌ | ❌ |

### Hook Implementation

```solidity
// Core Hook functions
function _beforeSwap(...) {
    // 1. Check user collateral value
    uint256 collateralValue = getCollateralValue(user);
    
    // 2. Check existing position value
    uint256 positionValue = getPositionValue(user);
    
    // 3. Calculate new LTV
    uint256 newLTV = (positionValue + swapAmount) / collateralValue;
    
    // 4. Revert if over limit
    require(newLTV <= MAX_LTV, "Insufficient collateral");
}

function _afterSwap(...) {
    // Update positions, check liquidations
    updatePosition(user, newAmount);
    checkLiquidation(user);
}
```

### Key Contracts

- **Polymarket CTF:** `0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E` (Polygon)
- **Uniswap v4 PoolManager:** Polygon deployment
- **Collateral Token:** kYES / kNO (Wrapped CTF tokens)

## Risk Analysis

Critical risks identified (see `references/risk-analysis.md` for details):

| Risk | Severity | Mitigation |
|------|----------|------------|
| Liquidation difficulty | 🔴 High | Limit markets, insurance pool |
| Oracle problem | 🟡 Medium | Use Polymarket CLOB prices |
| Settlement risk | 🔴 High | Force close before settlement |
| Low LTV efficiency | 🟡 Medium | Accept 30-40% LTV |
| Two-sided liquidity | 🟡 Medium | Bootstrap with treasury |

### MVP Constraints

To manage risk, MVP should:
- ✅ Only support high-liquidity markets (>$1M)
- ✅ Only support markets >30 days from settlement
- ✅ Low LTV (30-40%)
- ✅ Forced early liquidation mechanism
- ✅ Insurance pool from protocol fees

## Hookathon Strategy

**Competition:** Uniswap Hook Incubator (Deadline: March 15)
**Prize Pool:** $25,000+
**Judges:** a16z, Variant, Dragonfly, USV, Uniswap Foundation

### Winning Formula

```
Win = Innovation × Execution × Pitch

Innovation: 9/10 (new DeFi primitive)
Execution: 7/10 (challenging but achievable)
Pitch: 9/10 ("Prediction market's Aave")
```

### MVP Scope (Simplified Feature 2)

Focus on the innovation: **Prediction positions as collateral**

```
Core Features:
✅ kYES/kNO as collateral
✅ beforeSwap checks collateral ratio
✅ afterSwap updates positions
✅ Basic liquidation logic

NOT in MVP:
❌ Multi-asset collateral (ETH, BTC)
❌ Full lending market
❌ Leverage trading
```

### Demo Script

```
1. "This is Kindred - Aave for prediction markets"

2. User deposits kYES position
   → Shows collateral value: $600 (price 0.60)
   → Shows borrowing capacity: $240 (40% LTV)

3. User borrows $200 USDC
   → Hook verifies collateral ✓
   → USDC transferred
   → Position still held

4. Price movement simulation
   → kYES drops to 0.40
   → Approaching liquidation threshold
   → Hook triggers warning/partial liquidation

5. "Future roadmap"
   → Multi-asset collateral
   → Full lending market
   → Leverage trading
```

## Builder Programs

### Polymarket Builder Program
- **Benefits:** Gasless transactions, API attribution, Leaderboard, Grants
- **Status:** To apply
- **Value:** Direct integration, transaction credits

### Opinion Labs Builder Program
- **Apply:** https://forms.gle/9oBLs9wns6sJVm87A
- **Benefits:** Priority API, Technical support, Grants & Rewards
- **Status:** To apply

### Strategy

Deploy on Polygon to maximize:
- ✅ Direct Polymarket integration
- ✅ Gasless trading benefits
- ✅ Builder Leaderboard participation
- ✅ Grant opportunities from multiple programs

## Business Model

### Revenue Sources

| Source | Mechanism | Estimate |
|--------|-----------|----------|
| Lending interest | 5-10% APY on borrowed USDC | Primary |
| Liquidation penalty | 5-10% of liquidated collateral | Secondary |
| Protocol fee | 0.1% of transaction volume | Ongoing |

### Year 1 Projections

```
TVL: $10M
Monthly Volume: $50M
Revenue:
- Interest: $10M × 8% = $800K
- Liquidations + Fees: $200K
- Total: ~$1M
```

## Development Roadmap

### Phase 1: Hookathon MVP (Now → March 15)
- [ ] Setup development environment
- [ ] Basic Hook framework
- [ ] Apply for Builder Programs
- [ ] Core: Collateral + Position opening
- [ ] Polymarket price integration
- [ ] Liquidation logic
- [ ] Testing
- [ ] Demo preparation
- [ ] Submit

### Phase 2: Post-Hackathon
- [ ] Multi-asset collateral (ETH/BTC via Aave)
- [ ] Full lending market
- [ ] Frontend development

### Phase 3: Expansion
- [ ] Leverage trading
- [ ] Additional prediction markets
- [ ] PTCG prediction market (passion project)

## Additional Resources

### Reference Files

- **`references/risk-analysis.md`** - Detailed risk analysis and mitigations
- **`references/technical-spec.md`** - Full technical specification
- **`references/pitch-deck.md`** - Investor pitch content

### Related Topics

- 虎克船長 topic in Little Lamb group
- `/Users/jhinresh/clawd/memory/prediction-market-aggregator-hook-design.md`
