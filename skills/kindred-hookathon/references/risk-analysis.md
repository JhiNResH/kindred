# Kindred Risk Analysis

Deep dive into potential problems and mitigations for prediction market lending.

## 1. Liquidation Difficulty 🔴 HIGH

### Problem

User collateralizes kYES (current price $0.60), borrows $300 USDC (50% LTV).
Sudden bad news → kYES drops to $0.20.

To liquidate:
- Who buys the rapidly devaluing kYES?
- Where's the liquidity?

Worse: Market settles → YES loses → kYES = $0
- Collateral instantly worthless
- Borrowed USDC becomes bad debt

### Mitigations

**A. Restrict eligible markets:**
- Only markets >30 days from settlement
- Only markets with >$1M liquidity

**B. Automatic early liquidation:**
- Force close 7 days before settlement
- No exceptions

**C. Insurance pool:**
- Protocol takes portion of interest as insurance
- Bad debt covered by insurance pool

**D. Dynamic LTV:**
- Closer to settlement → Lower LTV
- Higher volatility → Lower LTV

## 2. Oracle Problem 🟡 MEDIUM

### Problem

Need on-chain kYES price in real-time.

But:
- Polymarket uses CLOB (order book), not AMM
- No constant on-chain price
- High price volatility, variable liquidity

How to build Oracle?
- Self-built? → Centralization risk
- Chainlink? → Probably no feed for this
- TWAP? → Too much delay

### Mitigations

**A. Self-built Oracle Relayer:**
- Fetch prices from Polymarket API
- Report to chain periodically
- Risk: Centralized, can be manipulated

**B. Use Polymarket internal price:**
- Read last trade price from Polymarket contracts
- More decentralized
- Risk: Can be manipulated by wash trades

**C. TWAP from Hook:**
- Create kYES/USDC pair in v4 Pool
- Use Hook to calculate TWAP
- Risk: Needs liquidity bootstrap

### Recommendation

Start with B (Polymarket internal price) for MVP.
Migrate to C (TWAP from own pool) as liquidity grows.

## 3. Settlement Risk 🔴 HIGH

### Problem

Prediction markets have settlement dates.

At settlement:
- Winning side → $1
- Losing side → $0

If user collateralizes kYES, result is NO:
- Collateral instantly = $0
- Borrower runs away
- Protocol takes bad debt

### Mitigations

**A. Time restrictions:**
- Only allow collateral for markets >30 days out
- Force liquidate as settlement approaches

**B. Settlement timeline:**
```
Day 30+: Normal LTV (40%)
Day 14-30: Reduced LTV (25%)
Day 7-14: Minimal LTV (10%)
Day 0-7: No new borrows, force liquidate existing
```

**C. Insurance premium:**
- Charge higher interest for markets closer to settlement
- Build insurance reserve

## 4. Low LTV Efficiency 🟡 MEDIUM

### Problem

Traditional lending LTV:
- ETH: 75-80% (volatility ~5%/day)
- BTC: 70-75%

Prediction positions:
- Volatility 20-50%/day possible
- 100% volatility at settlement

Safe LTV might only be 20-30%:
- Capital inefficient
- Users have no incentive to use

### Mitigations

**Accept reality:**
- Start with 30-40% LTV
- Build track record
- Gradually increase based on data

**Dynamic LTV based on:**
- Market liquidity
- Time to settlement
- Historical volatility
- Position size relative to market

**Offer value elsewhere:**
- Convenience (no need to sell position)
- Leverage capability
- Hedging use cases

## 5. Two-Sided Liquidity 🟡 MEDIUM

### Problem

Borrowers: Collateralize kYES, borrow USDC ✓
Depositors: Who deposits USDC for lending?

Need:
- Sufficient USDC deposits
- Depositors willing to take risk
- Attractive interest rates

Chicken and egg:
- No deposits → Can't borrow
- No borrowing → No yield for deposits
- No yield → No deposits

### Mitigations

**A. Protocol-owned liquidity:**
- Use fundraise/treasury as initial deposits
- Bootstrap the market

**B. Integrate Aave:**
- Borrow Aave's deposits
- More complex but scalable

**C. Yield subsidies:**
- Early depositors get token rewards
- Temporary until organic growth

**D. Targeted marketing:**
- Find yield farmers
- DeFi-native users understand the risk

## 6. Liquidity Depth 🟡 MEDIUM

### Problem

Liquidation requires selling collateral.
Prediction market liquidity can be shallow.

Large liquidation → Severe slippage
Slippage → Can't fully liquidate → Bad debt

### Mitigations

**A. Position size limits:**
- Max position relative to market liquidity
- E.g., max 1% of market depth

**B. Gradual liquidation:**
- Don't dump all at once
- Liquidate over multiple blocks

**C. Liquidation incentives:**
- Competitive liquidation bots
- Generous liquidation bonus

## 7. Regulatory Risk 🟡 MEDIUM

### Problem

- Lending + Prediction markets = Double regulatory risk
- Kalshi already fighting CFTC
- Leveraged prediction markets more sensitive

### Mitigations

**A. Geographic restrictions:**
- Block US users initially
- Add compliance later

**B. Decentralization:**
- Fully on-chain, permissionless
- No central entity to sue

**C. Move fast:**
- Build and launch
- Deal with regulation later
- Standard crypto playbook

## 8. Competition 🟡 MEDIUM

### Problem

If this idea is good, Polymarket can do it themselves.
They have:
- Liquidity
- Users
- Capital

What's our moat?

### Mitigations

**Moat strategy:**

1. **First mover advantage:**
   - Build first, capture market
   - Network effects kick in

2. **Multi-market integration:**
   - Not just Polymarket
   - Opinion Labs, Kalshi (via oracle)
   - Polymarket won't aggregate competitors

3. **v4 Hook technology:**
   - Polymarket might not want to build AMM
   - They're CLOB-focused

4. **DeFi composability:**
   - They're prediction experts, not DeFi experts
   - We bring DeFi primitives to them

## Risk Summary Matrix

| Risk | Severity | Likelihood | Mitigation Difficulty | Priority |
|------|----------|------------|----------------------|----------|
| Liquidation | 🔴 High | High | Hard | P0 |
| Settlement | 🔴 High | Medium | Medium | P0 |
| Oracle | 🟡 Medium | High | Medium | P1 |
| Low LTV | 🟡 Medium | Certain | Accept | P2 |
| Two-sided | 🟡 Medium | High | Medium | P1 |
| Liquidity | 🟡 Medium | Medium | Medium | P2 |
| Regulatory | 🟡 Medium | Medium | Hard | P3 |
| Competition | 🟡 Medium | Medium | Ongoing | P3 |

## MVP Risk Mitigation

For Hookathon MVP, implement:

1. ✅ Market restrictions (>30 days, >$1M liquidity)
2. ✅ Conservative LTV (30-40%)
3. ✅ Use Polymarket prices directly
4. ✅ Force close mechanism before settlement
5. ✅ Position size limits
6. ⏳ Insurance pool (v2)
7. ⏳ Dynamic LTV (v2)
8. ⏳ Multi-oracle (v2)
