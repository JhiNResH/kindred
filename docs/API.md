# Kindred API Documentation

> Base URL: `/api`

## Health

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "kindred-api",
  "version": "0.1.0",
  "timestamp": "2026-02-03T10:00:00.000Z"
}
```

---

## Markets

### GET /api/markets
List prediction markets (aggregated from Polymarket).

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category (crypto, defi, politics, sports) |
| `limit` | number | Max results (default: 20) |
| `q` | string | Search query |

**Response:**
```json
{
  "markets": [
    {
      "id": "string",
      "question": "Will Bitcoin reach $100k?",
      "slug": "bitcoin-100k",
      "category": "crypto",
      "source": "polymarket",
      "outcomes": [
        { "name": "Yes", "price": 0.65 },
        { "name": "No", "price": 0.35 }
      ],
      "volume": "2300000",
      "liquidity": "500000",
      "endDate": "2026-12-31T23:59:59Z",
      "resolved": false
    }
  ],
  "total": 20,
  "categories": ["crypto", "defi", "politics", "sports"],
  "lastUpdated": "2026-02-03T10:00:00.000Z"
}
```

### GET /api/markets/[id]
Get single market details.

**Response:**
```json
{
  "market": { ... },
  "source": "polymarket",
  "polymarketUrl": "https://polymarket.com/event/..."
}
```

---

## Positions

### GET /api/positions
List user positions.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `address` | string | Wallet address (required) |
| `status` | string | Filter: open, closed, settled |

**Response:**
```json
{
  "positions": [
    {
      "id": "pos_123",
      "userAddress": "0x...",
      "marketId": "mock-1",
      "marketQuestion": "Will Bitcoin reach $100k?",
      "outcome": "yes",
      "shares": "100",
      "avgPrice": 0.55,
      "currentPrice": 0.65,
      "pnl": 10,
      "pnlPercent": 18.18,
      "status": "open"
    }
  ],
  "totalValue": "65.00",
  "totalPnl": "10.00",
  "openCount": 1
}
```

### POST /api/positions
Create a new position.

**Body:**
```json
{
  "userAddress": "0x...",
  "marketId": "mock-1",
  "marketQuestion": "Will Bitcoin reach $100k?",
  "outcome": "yes",
  "shares": "100",
  "avgPrice": 0.55
}
```

### PATCH /api/positions
Update or close a position.

**Body:**
```json
{
  "positionId": "pos_123",
  "action": "close",
  "currentPrice": 0.70
}
```

---

## Token ($KIND)

### GET /api/token
Get KIND token info and bonding curve data.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `chart` | boolean | Include chart data points |

**Response:**
```json
{
  "name": "Kindred Token",
  "symbol": "KIND",
  "address": null,
  "deployed": false,
  "currentPrice": "0.001",
  "bondingCurve": {
    "maxSupply": "1000000",
    "mintRoyalty": 100,
    "burnRoyalty": 100,
    "steps": [
      { "supply": "0", "price": "0.001" },
      { "supply": "100000", "price": "0.005" },
      { "supply": "500000", "price": "0.01" }
    ]
  },
  "contracts": {
    "MCV2_Bond": "0xc5a076cad94176c2996B32d8466Be1cE757FAa27",
    "OPENWORK": "0x299c30DD5974BF4D5bFE42C340CA40462816AB07"
  }
}
```

### POST /api/token
Get quote for buying/selling KIND.

**Body:**
```json
{
  "amount": "1000",
  "action": "buy"
}
```

**Response:**
```json
{
  "action": "buy",
  "amount": "1000",
  "baseCost": "1.000000",
  "royalty": "0.010000",
  "total": "1.010000",
  "avgPrice": "0.001000",
  "currency": "OPENWORK"
}
```

---

## Reviews

### GET /api/reviews
List reviews.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category |
| `target` | string | Filter by project address/name |
| `sort` | string | hot, new, top (default: hot) |

### POST /api/reviews
Create a review.

**Body:**
```json
{
  "targetAddress": "0x...",
  "targetName": "Hyperliquid",
  "rating": 5,
  "content": "Great perp DEX!",
  "category": "k/perp-dex",
  "predictedRank": 1,
  "stakeAmount": "5000000000000000000"
}
```

### POST /api/reviews/[id]/vote
Vote on a review.

**Body:**
```json
{
  "direction": "up",
  "voterAddress": "0x..."
}
```

---

## Stakes

### GET /api/stakes
List stakes.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `address` | string | Staker address |
| `project` | string | Project address |
| `status` | string | active, won, lost, pending |

### POST /api/stakes
Create a stake.

**Body:**
```json
{
  "stakerAddress": "0x...",
  "projectAddress": "0x...",
  "projectName": "Hyperliquid",
  "predictedRank": 1,
  "amount": "5000000000000000000",
  "reviewId": "rev_123"
}
```

---

## Leaderboard

### GET /api/leaderboard
Get project rankings.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category |
| `limit` | number | Max results (default: 20) |

---

## Users

### GET /api/users/[address]
Get user profile and reputation.

**Response:**
```json
{
  "address": "0x...",
  "displayName": "DeFiChad.eth",
  "totalReviews": 45,
  "totalUpvotes": 320,
  "totalStaked": "50000000000000000000",
  "winRate": 70,
  "reputationScore": 2450,
  "level": "trusted",
  "badges": ["Active Reviewer", "Predictor"]
}
```

---

## Frontend Integration

Use the provided hooks for easy integration:

```typescript
import { useMarkets, usePositions, useToken } from '@/hooks'

// Markets
const { markets, isLoading, refetch } = useMarkets({ category: 'crypto' })

// Positions
const { positions, createPosition, closePosition } = usePositions({ address })

// Token
const { token, getQuote } = useToken()
const quote = await getQuote('1000', 'buy')
```

---

*Last updated: 2026-02-03 by Steve Jobs 🍎*
