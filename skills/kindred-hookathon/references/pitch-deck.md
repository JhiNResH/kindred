# Kindred Pitch Deck Content

## For Hookathon Demo

### 30-Second Pitch

```
"Hi, I'm building Kindred.

Problem: You have ETH, you want to play prediction markets.
But you don't want to sell your ETH.

Traditional way: Sell ETH → USDC → Buy prediction
You lose ETH exposure.

Kindred solution: Collateralize ETH → Directly open prediction position
Keep ETH + Play predictions.

Even better: Use your prediction positions as collateral to borrow USDC.
First time prediction positions become composable DeFi assets.

We're the Aave for prediction markets.

[Demo]

Why v4 Hook:
- beforeSwap checks collateral ratio
- afterSwap handles liquidations
- Can't do this without Hooks

Thank you."
```

### Demo Flow

**Screen 1: Dashboard**
```
Kindred - Prediction Market DeFi
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your Collateral: $0
Borrowing Capacity: $0
Current Debt: $0
Health Factor: N/A
```

**Screen 2: Deposit Collateral**
```
Deposit kYES tokens as collateral

Market: "Will Trump win 2024?"
kYES Balance: 1,000 tokens
Current Price: $0.60

[Deposit 1,000 kYES]

Your Collateral: $600
Borrowing Capacity: $240 (40% LTV)
```

**Screen 3: Borrow USDC**
```
Borrow against your collateral

Available to borrow: $240
Interest Rate: 8% APY

Amount: [200] USDC

[Borrow]

Current Debt: $200
Health Factor: 1.5 ✓
```

**Screen 4: Price Movement**
```
⚠️ Market Movement Alert

kYES price dropped: $0.60 → $0.45

Your Collateral: $450
Current Debt: $200
Health Factor: 1.125 ⚠️

Liquidation at: Health Factor < 1.0
```

**Screen 5: Liquidation Warning**
```
🚨 Approaching Liquidation

kYES price: $0.40

Your Collateral: $400
Current Debt: $200
Health Factor: 1.0 🔴

Options:
[Add Collateral] [Repay Debt]
```

---

## For Investor Pitch (區塊先生)

### Slide 1: Title

```
🐺 Kindred

"The Aave for Prediction Markets"

Uniswap Hookathon 2025 Participant
```

### Slide 2: Problem

```
Prediction Markets Are Isolated

Current State:
• $1B+ monthly volume on Polymarket
• 500K+ active traders
• BUT positions are locked

Pain Points:
1. Must hold USDC to participate
   (ETH holders excluded)
   
2. Can't use positions productively
   (No borrowing, no composability)
   
3. Capital inefficient
   (Money sits idle)

"Prediction markets are DeFi's biggest
 missed composability opportunity"
```

### Slide 3: Solution

```
Kindred = DeFi Layer for Predictions

Two-Way System:

┌────────────────────────────────────┐
│                                    │
│   ETH/BTC ──────► Predictions     │
│   (Don't sell your crypto)         │
│                                    │
│   Predictions ──► USDC/Leverage   │
│   (Unlock your capital)            │
│                                    │
└────────────────────────────────────┘

First protocol to make prediction
positions into composable DeFi assets
```

### Slide 4: How It Works

```
User Journey

1. Alice has $10K in ETH
   Wants to bet on Trump
   
2. Traditional:
   Sell ETH → USDC → Buy YES
   ❌ Lost ETH exposure
   
3. With Kindred:
   Collateralize ETH → Open YES position
   ✅ Keep ETH + Have prediction exposure

4. Even better:
   Collateralize YES position
   → Borrow USDC
   → Buy more YES
   ✅ Leverage on predictions!
```

### Slide 5: Market Size

```
Massive Untapped Market

TAM: DeFi Lending + Prediction Markets
• Aave TVL: $12B
• Polymarket Volume: $500M/month
• Combined: $50B+ potential

SAM: Crypto Prediction Traders
• Active traders: 500K+
• Average position: $5K
• Market: $2.5B

SOM: Year 1 Target
• TVL: $10M
• Monthly Volume: $50M
• Revenue: $1M
```

### Slide 6: Technology

```
Built on Uniswap v4 Hooks

Why Hooks?
• beforeSwap: Validate collateral ratio
• afterSwap: Update positions, liquidate
• Native integration with Uniswap
• Can't be replicated without v4

Stack:
• Chain: Polygon
• AMM: Uniswap v4
• Prediction: Polymarket direct integration
• Innovation: First v4 + Prediction DeFi
```

### Slide 7: Business Model

```
Clear Revenue Streams

┌─────────────────────────────────────┐
│  Revenue Source    │  Rate  │ Est. │
├─────────────────────────────────────┤
│  Lending Interest  │  5-10% │ 60%  │
│  Liquidation Fees  │  5-10% │ 20%  │
│  Protocol Fees     │  0.1%  │ 20%  │
└─────────────────────────────────────┘

Year 1 Projections ($10M TVL):
• Interest: $800K
• Liquidations: $100K  
• Protocol: $100K
• Total: ~$1M revenue

Sustainable, not token-dependent
```

### Slide 8: Traction

```
Building Momentum

✅ Completed:
• Product design finalized
• Risk analysis complete
• Technical architecture ready

🔄 In Progress:
• Hookathon submission (March 15)
• Builder Program applications
  - Polymarket
  - Opinion Labs

🎯 Coming:
• MVP launch (Q2 2025)
• Mainnet deployment
```

### Slide 9: Competition

```
Competitive Landscape

No Direct Competitor

┌─────────────────────────────────────────┐
│           │ Prediction │ DeFi  │ Hook  │
│           │ Integration│ Native│ Based │
├─────────────────────────────────────────┤
│ Kindred   │     ✅     │  ✅   │  ✅   │
│ Aave      │     ❌     │  ✅   │  ❌   │
│ Polymarket│     ✅     │  ❌   │  ❌   │
│ dYdX      │     ❌     │  ✅   │  ❌   │
└─────────────────────────────────────────┘

Moats:
1. First mover in prediction DeFi
2. v4 Hook technology
3. Multi-market aggregation
4. DeFi composability expertise
```

### Slide 10: Team

```
Team

JhiNResH
• Web3 Developer
• Solidity / DeFi experience
• Uniswap Hook Incubator participant

Kindred (AI Co-Pilot) 🐺
• 24/7 research & development support
• Technical documentation
• Market analysis

Looking for:
• Smart contract auditor (advisor)
• Frontend developer
• DeFi advisor
```

### Slide 11: Roadmap

```
Development Roadmap

Q1 2025 - Hookathon
├─ MVP development
├─ Competition submission
└─ Builder Programs

Q2 2025 - Launch
├─ Testnet deployment
├─ Audit (if funded)
└─ Mainnet beta

Q3 2025 - Growth
├─ Multi-asset collateral
├─ Additional markets
└─ $10M TVL target

Q4 2025 - Expansion
├─ Leverage trading
├─ Advanced features
└─ Series A preparation
```

### Slide 12: Ask

```
Seed Round: $300K - $500K

Use of Funds:
┌─────────────────────────────────────┐
│  40% │ Development & Audit          │
│  30% │ Liquidity Bootstrap          │
│  20% │ Operations (6 months)        │
│  10% │ Legal & Compliance           │
└─────────────────────────────────────┘

Milestones:
• M1-2: MVP on mainnet
• M3-4: $1M TVL
• M6: $10M TVL
• M12: Series A ready

Why Now?
• v4 just launched - first mover advantage
• Prediction markets booming
• Perfect timing for this primitive
```

### Slide 13: Contact

```
Let's Build Together

🐺 Kindred
"The Aave for Prediction Markets"

JhiNResH
Telegram: @jhinresh

---

"Making prediction positions
 the next DeFi primitive"
```

---

## Key Talking Points

### For Technical Audience (Hookathon)

1. **Hook Innovation:**
   - First v4 Hook for prediction market integration
   - Uses beforeSwap, afterSwap, and Custom Accounting
   - Novel collateralization mechanism

2. **Technical Depth:**
   - Direct Polymarket CTF integration
   - On-chain price oracle design
   - Liquidation engine in hooks

3. **Why v4 Specifically:**
   - Hooks enable custom swap logic
   - Singleton architecture reduces gas
   - Flash accounting for efficiency

### For Business Audience (Investors)

1. **Market Opportunity:**
   - Prediction markets growing exponentially
   - DeFi composability is the future
   - Untapped intersection

2. **Business Model:**
   - Real revenue from day one
   - Not dependent on token inflation
   - Clear path to profitability

3. **Timing:**
   - v4 just launched
   - Prediction markets at ATH
   - First mover advantage window

### Objection Handling

**"Why won't Polymarket do this themselves?"**
> They're prediction experts, not DeFi experts. They optimize for trading UX, not composability. Also, we aggregate competitors - they won't.

**"What about liquidation risk?"**
> We've designed conservative parameters (30-40% LTV), market restrictions (>30 days to settlement), and insurance pools. Risk is managed, not ignored.

**"How do you bootstrap liquidity?"**
> Three approaches: (1) Fundraise provides initial deposits, (2) Yield incentives for early depositors, (3) Potential Aave integration for scaling.

**"Regulatory concerns?"**
> Fully decentralized, on-chain. No central entity. Standard crypto approach - build first, engage regulators as needed.
