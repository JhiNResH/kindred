#!/usr/bin/env python3
"""
Polymarket Trading Bot
Auto-detects and bets on high-edge opportunities
"""

import os
import json
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# Configuration
GAMMA_API = "https://gamma-api.polymarket.com"
CLOB_API = "https://clob.polymarket.com"
DAILY_BUDGET_USDC = float(os.getenv("DAILY_BUDGET", "10"))  # Default $10/day
MAX_BET_SIZE = float(os.getenv("MAX_BET_SIZE", "5"))  # Max per bet
MIN_EDGE = float(os.getenv("MIN_EDGE", "0.10"))  # Minimum 10% edge to bet
PRIVATE_KEY = os.getenv("POLY_PRIVATE_KEY")

class PolymarketBot:
    def __init__(self):
        self.spent_today = 0
        self.trades = []
        
    def fetch_markets(self):
        """Fetch active markets from Gamma API"""
        url = f"{GAMMA_API}/markets?closed=false&active=true&limit=100"
        resp = requests.get(url)
        return resp.json() if resp.status_code == 200 else []
    
    def fetch_market_details(self, condition_id):
        """Get detailed market data"""
        url = f"{GAMMA_API}/markets/{condition_id}"
        resp = requests.get(url)
        return resp.json() if resp.status_code == 200 else None
    
    def analyze_opportunity(self, market):
        """
        Analyze if market has a betting edge
        Returns: (should_bet, side, edge, confidence)
        """
        try:
            # Get current price - handle various formats
            prices_raw = market.get('outcomePrices', '[0.5,0.5]')
            if isinstance(prices_raw, str):
                # Remove brackets and quotes, then split
                prices_raw = prices_raw.strip('[]').replace('"', '').replace("'", "")
                prices = [float(p.strip()) for p in prices_raw.split(',')]
            else:
                prices = prices_raw
            yes_price = float(prices[0])
            no_price = 1 - yes_price
            
            # Get volume and liquidity
            volume = float(market.get('volume', 0) or 0)
            liquidity = float(market.get('liquidity', 0) or 0)
            
            # Skip low liquidity markets
            if liquidity < 10000:
                return (False, None, 0, 0)
            
            # Time-based analysis
            end_date = market.get('endDate')
            if end_date:
                end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                days_left = (end_dt - datetime.now(end_dt.tzinfo)).days
                
                # Look for mispriced markets near resolution
                if days_left <= 3:
                    # Near-term markets with extreme prices are often good bets
                    if yes_price < 0.15:
                        # Check if "No" is almost certain
                        return (True, 'NO', 0.15 - yes_price, 0.7)
                    elif yes_price > 0.85:
                        # Check if "Yes" is almost certain
                        return (True, 'YES', yes_price - 0.85, 0.7)
            
            # Volume spike detection (high volume = information)
            if volume > 1000000:  # $1M+ volume
                # High volume markets often have informed traders
                # Follow the momentum
                if yes_price > 0.65:
                    return (True, 'YES', yes_price - 0.5, 0.6)
                elif yes_price < 0.35:
                    return (True, 'NO', 0.5 - yes_price, 0.6)
            
            # Mean reversion for extreme odds with time
            if days_left and days_left > 30:
                if yes_price < 0.10 or yes_price > 0.90:
                    # Extreme odds far from resolution often revert
                    # Don't bet these - too uncertain
                    pass
            
            # Strategy: High confidence near-certain outcomes
            # If market is >92% and has high volume, follow the crowd
            if yes_price > 0.92 and volume > 500000:
                return (True, 'YES', yes_price - 0.85, 0.8)
            if yes_price < 0.08 and volume > 500000:
                return (True, 'NO', 0.85 - (1 - yes_price), 0.8)
            
            # Strategy: Sports markets with clear favorites
            question = market.get('question', '').lower()
            if 'super bowl' in question or 'nfl' in question or 'nba' in question:
                if volume > 100000:
                    if yes_price > 0.70:
                        return (True, 'YES', yes_price - 0.55, 0.65)
                    elif yes_price < 0.30:
                        return (True, 'NO', 0.55 - yes_price, 0.65)
            
            return (False, None, 0, 0)
            
        except Exception as e:
            print(f"Error analyzing {market.get('question', 'unknown')}: {e}")
            return (False, None, 0, 0)
    
    def calculate_bet_size(self, edge, confidence, remaining_budget):
        """Kelly criterion-inspired bet sizing"""
        # Simplified Kelly: bet = edge * bankroll * confidence
        kelly_fraction = edge * confidence * 0.5  # Half Kelly
        raw_bet = remaining_budget * kelly_fraction
        
        # Minimum bet $1, but if edge is good enough, bet at least $1
        min_bet = 1.0
        if raw_bet < min_bet and edge >= 0.15 and remaining_budget >= min_bet:
            bet_size = min_bet  # Force minimum bet for high edge opportunities
        else:
            bet_size = raw_bet
        
        bet_size = min(bet_size, MAX_BET_SIZE, remaining_budget)
        return bet_size if bet_size >= min_bet else 0
    
    def place_bet(self, market, side, amount):
        """
        Place a bet on Polymarket
        Returns: success, order_id
        """
        if not PRIVATE_KEY:
            print(f"[DRY RUN] Would bet ${amount:.2f} on {side} for: {market.get('question', 'unknown')[:50]}")
            return True, "dry-run"
        
        try:
            from py_clob_client.client import ClobClient
            from py_clob_client.clob_types import OrderArgs
            from py_clob_client.constants import POLYGON
            
            # Signature type: 0=EOA, 1=POLY_PROXY, 2=GNOSIS_SAFE
            SIG_TYPE = int(os.getenv("POLY_SIG_TYPE", "2"))  # Default to browser wallet
            FUNDER = os.getenv("POLY_FUNDER", "")  # Proxy wallet address
            
            client = ClobClient(
                CLOB_API,
                key=PRIVATE_KEY,
                chain_id=POLYGON,
                signature_type=SIG_TYPE,
                funder=FUNDER if FUNDER else None
            )
            
            # Derive and set API credentials
            creds = client.derive_api_key()
            client.set_api_creds(creds)
            
            # Get token ID for the side we want
            tokens = json.loads(market.get('clobTokenIds', '[]'))
            token_id = tokens[0] if side == 'YES' else tokens[1]
            
            # Get current price - handle various formats
            prices_raw = market.get('outcomePrices', '[0.5,0.5]')
            prices_raw = prices_raw.strip('[]').replace('"', '').replace("'", "")
            prices = [float(p.strip()) for p in prices_raw.split(',')]
            price = prices[0] if side == 'YES' else prices[1]
            
            # Calculate size (shares = amount / price)
            size = amount / price
            
            order = client.create_and_post_order(OrderArgs(
                token_id=token_id,
                price=price,
                size=size,
                side="BUY"
            ))
            
            print(f"[LIVE] Bet ${amount:.2f} on {side} @ {price:.2f}: {market.get('question', '')[:50]}")
            return True, order.get('orderID')
            
        except Exception as e:
            print(f"Error placing bet: {e}")
            return False, None
    
    def run(self):
        """Main bot execution"""
        print(f"\n{'='*60}")
        print(f"Polymarket Bot Run - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        print(f"Budget: ${DAILY_BUDGET_USDC} | Max per bet: ${MAX_BET_SIZE}")
        print(f"{'='*60}\n")
        
        remaining_budget = DAILY_BUDGET_USDC
        opportunities = []
        
        # Fetch and analyze markets
        markets = self.fetch_markets()
        print(f"Analyzing {len(markets)} active markets...\n")
        
        for market in markets:
            should_bet, side, edge, confidence = self.analyze_opportunity(market)
            if should_bet and edge >= MIN_EDGE:
                opportunities.append({
                    'market': market,
                    'side': side,
                    'edge': edge,
                    'confidence': confidence,
                    'score': edge * confidence
                })
        
        # Sort by score (best opportunities first)
        opportunities.sort(key=lambda x: x['score'], reverse=True)
        
        print(f"Found {len(opportunities)} opportunities with edge >= {MIN_EDGE*100:.0f}%\n")
        
        # Show top opportunities
        if opportunities:
            print("Top opportunities:")
            for i, opp in enumerate(opportunities[:5]):
                m = opp['market']
                print(f"  {i+1}. [{opp['side']}] {m.get('question', 'unknown')[:60]}")
                print(f"     Edge: {opp['edge']*100:.1f}% | Confidence: {opp['confidence']*100:.0f}%")
            print()
        
        # Execute bets
        for opp in opportunities:
            if remaining_budget < 1:
                print("Daily budget exhausted.")
                break
                
            bet_size = self.calculate_bet_size(
                opp['edge'], 
                opp['confidence'], 
                remaining_budget
            )
            
            if bet_size > 0:
                market = opp['market']
                success, order_id = self.place_bet(market, opp['side'], bet_size)
                
                if success:
                    remaining_budget -= bet_size
                    self.trades.append({
                        'time': datetime.now().isoformat(),
                        'market': market.get('question', '')[:80],
                        'side': opp['side'],
                        'amount': bet_size,
                        'edge': opp['edge'],
                        'order_id': order_id,
                        'dry_run': not PRIVATE_KEY
                    })
        
        # Summary
        print(f"\n{'='*60}")
        print(f"Session Summary")
        print(f"{'='*60}")
        print(f"Trades executed: {len(self.trades)}")
        print(f"Total spent: ${DAILY_BUDGET_USDC - remaining_budget:.2f}")
        print(f"Remaining budget: ${remaining_budget:.2f}")
        
        if self.trades:
            print(f"\nTrades:")
            for t in self.trades:
                print(f"  - ${t['amount']:.2f} {t['side']} | {t['market'][:50]}...")
        
        return self.trades


def main():
    bot = PolymarketBot()
    trades = bot.run()
    
    # Save trades log
    log_file = f"trades_{datetime.now().strftime('%Y%m%d')}.json"
    with open(log_file, 'w') as f:
        json.dump(trades, f, indent=2)
    print(f"\nTrades saved to {log_file}")


if __name__ == "__main__":
    main()
