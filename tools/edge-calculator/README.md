# Edge Calculator

A CLI tool for calculating Expected Value (EV) and Kelly Criterion for prediction market betting.

## Installation

```bash
npm install
npm link
```

Now you can use the `edge` command from anywhere!

## Features

- Calculate Expected Value (EV) to determine if a bet is profitable
- Calculate Kelly Criterion for optimal bet sizing
- Support for both command-line arguments and interactive mode
- Clean, colorized output
- Helpful examples and validation

## Usage

### Interactive Mode

Simply run `edge` without any arguments:

```bash
edge
```

This will guide you through the calculation with prompts.

### Calculate Expected Value

```bash
edge ev --prob 0.65 --price 0.55
```

**Example:** You think there's a 65% chance of an event occurring, but the market is pricing it at 55%.

Output:
```
=== Expected Value Calculation ===

Your Probability: 65.0%
Market Price: 55.0%

✓ Expected Value: +18.18%
Edge over market: 10.00%

✓ This is a positive EV bet!
```

### Calculate Kelly Criterion

```bash
edge kelly --prob 0.65 --price 0.55 --bankroll 1000
```

**Example:** Same scenario, but with a $1000 bankroll to calculate optimal bet size.

Output:
```
=== Kelly Criterion Calculation ===

Your Probability: 65.0%
Market Price: 55.0%
Bankroll: $1000.00

✓ Expected Value: +18.18%
Edge over market: 10.00%

✓ Kelly Criterion: 22.22%

→ Suggested bet size: $222.22
  (22.22% of your $1000 bankroll)

💡 Consider using fractional Kelly (e.g., 50% of Kelly) for more conservative sizing.
```

## Commands

### `edge ev`

Calculate Expected Value.

**Options:**
- `-p, --prob <number>` - Your estimated probability (0-1)
- `-P, --price <number>` - Market price/odds (0-1)

**Example:**
```bash
edge ev --prob 0.7 --price 0.6
```

### `edge kelly`

Calculate Kelly Criterion for optimal bet sizing.

**Options:**
- `-p, --prob <number>` - Your estimated probability (0-1)
- `-P, --price <number>` - Market price/odds (0-1)
- `-b, --bankroll <number>` - Your total bankroll (optional)

**Example:**
```bash
edge kelly --prob 0.7 --price 0.6 --bankroll 500
```

## Understanding the Math

### Expected Value (EV)

Expected Value tells you the average amount you expect to win or lose per bet in the long run.

**Formula:**
```
EV = (probability × profit_if_win) - ((1 - probability) × loss_if_lose)
```

Where:
- For a $1 stake at price P
- Payout if you win = $1/P
- Profit if you win = $(1/P - 1)
- Loss if you lose = $1

**Positive EV** = Good bet (you expect to profit over time)
**Negative EV** = Bad bet (you expect to lose over time)

### Kelly Criterion

Kelly Criterion tells you what percentage of your bankroll you should bet to maximize long-term growth.

**Formula:**
```
Kelly % = (probability - price) / (1 - price)
```

**Important Notes:**
- Kelly assumes your probability estimate is accurate
- Full Kelly can be aggressive - many pros use "fractional Kelly" (e.g., 50% or 25% of the Kelly percentage)
- Never bet more than Kelly suggests - it increases risk of ruin
- If Kelly is negative or zero, don't bet!

## Examples

### Scenario 1: Strong Edge

You think a candidate has a 70% chance of winning, but the market prices it at 55%.

```bash
edge kelly --prob 0.7 --price 0.55 --bankroll 1000
```

Result: Kelly suggests betting 33.33% ($333.33) - a significant edge!

### Scenario 2: Small Edge

You think the probability is 52%, market says 50%.

```bash
edge kelly --prob 0.52 --price 0.50 --bankroll 1000
```

Result: Kelly suggests betting 4% ($40) - small edge, small bet.

### Scenario 3: No Edge

You think the probability is 50%, market says 50%.

```bash
edge ev --prob 0.5 --price 0.5
```

Result: EV = 0%, no edge. Don't bet!

### Scenario 4: Negative Edge

You think the probability is 45%, market says 50%.

```bash
edge ev --prob 0.45 --price 0.5
```

Result: Negative EV. Market has better odds than you - don't bet!

## Tips for Use

1. **Be honest with your probability estimates** - Overconfidence leads to overbetting
2. **Use fractional Kelly** - Consider betting 25-50% of the Kelly recommendation for safety
3. **Track your results** - Keep a record to calibrate your probability estimates
4. **Understand the market** - Why is the market price different from your estimate?
5. **Never bet more than you can afford to lose** - Kelly assumes you can make many bets over time

## Real-World Applications

- **Prediction Markets**: Polymarket, Kalshi, PredictIt
- **Sports Betting**: If you have better odds estimates than bookmakers
- **Stock Options**: If you have conviction on volatility vs. implied volatility
- **Any Binary Outcome**: Where you can estimate probability and there's a market price

## Help

```bash
edge --help
edge ev --help
edge kelly --help
```

## License

MIT
