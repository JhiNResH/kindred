#!/usr/bin/env python3
"""
Polymarket Sports Bot
自動掃描 +EV 機會並通知

Usage:
    python main.py scan     # 單次掃描
    python main.py watch    # 持續監控
"""

import sys
import time
import json
from datetime import datetime
from typing import List, Dict, Optional

# 本地模組
from scrapers.espn_injuries import get_todays_significant_injuries, NBA_STARS
from analysis.ev_calculator import calculate_ev, estimate_probability_with_injuries, format_ev_report
from analysis.edge_scorer import score_opportunity, format_edge_report
import config

def get_todays_games() -> List[Dict]:
    """
    取得今天的比賽 (需要實作 Polymarket 爬蟲)
    目前返回 mock 數據
    """
    # TODO: 實作 Polymarket 爬蟲
    # 暫時返回範例
    return [
        {
            "home": "Pistons",
            "away": "Suns", 
            "home_odds": 0.59,
            "away_odds": 0.41,
            "home_record": "34-11",
            "away_record": "28-19",
            "time": "7:00 PM"
        }
    ]

def analyze_game(game: Dict, injuries: List[Dict]) -> Optional[Dict]:
    """
    分析單場比賽是否有 +EV 機會
    """
    home = game["home"]
    away = game["away"]
    home_odds = game["home_odds"]
    
    # 找出雙方傷病
    home_injuries = [i for i in injuries if home.lower() in i["team"].lower()]
    away_injuries = [i for i in injuries if away.lower() in i["team"].lower()]
    
    # 計算明星傷病數
    home_star_out = len([i for i in home_injuries if i["player"] in NBA_STARS])
    away_star_out = len([i for i in away_injuries if i["player"] in NBA_STARS])
    
    # 估計主隊真實勝率
    base_prob = home_odds  # 用市場賠率作為基礎
    estimated_prob = estimate_probability_with_injuries(
        base_prob=base_prob,
        home_advantage=True,
        star_injuries_home=home_star_out,
        star_injuries_away=away_star_out
    )
    
    # 計算 EV
    ev_result = calculate_ev(
        market_odds=home_odds,
        estimated_prob=estimated_prob,
        bankroll=config.BANKROLL
    )
    
    # 評估 Edge
    edge_score = score_opportunity(
        star_injuries_opponent=away_star_out,
        star_injuries_team=home_star_out,
        market_odds=home_odds,
        estimated_prob=estimated_prob,
        is_home=True
    )
    
    # 如果有機會，返回分析結果
    if ev_result.ev_percent >= config.MIN_EV_PERCENT and edge_score.total >= config.MIN_EDGE_SCORE:
        return {
            "game": f"{away} @ {home}",
            "bet": f"{home} ML",
            "odds": home_odds,
            "estimated_prob": estimated_prob,
            "ev_result": ev_result,
            "edge_score": edge_score,
            "injuries": {
                "home": home_injuries,
                "away": away_injuries
            }
        }
    
    return None

def scan_opportunities() -> List[Dict]:
    """
    掃描所有機會
    """
    print(f"🔍 掃描時間: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 50)
    
    # 取得傷病資訊
    injuries = get_todays_significant_injuries("nba")
    print(f"📋 發現 {len(injuries)} 個重大傷病")
    for i in injuries:
        print(f"   ⚠️ {i['player']} ({i['team']}) - OUT")
    print()
    
    # 取得今天比賽
    games = get_todays_games()
    print(f"🏀 今天 {len(games)} 場比賽")
    print()
    
    # 分析每場比賽
    opportunities = []
    for game in games:
        result = analyze_game(game, injuries)
        if result:
            opportunities.append(result)
    
    return opportunities

def format_opportunity(opp: Dict) -> str:
    """
    格式化機會報告
    """
    ev = opp["ev_result"]
    edge = opp["edge_score"]
    
    lines = [
        "🎯 發現 +EV 機會!",
        "━━━━━━━━━━━━━━━━━━━━━",
        f"比賽: {opp['game']}",
        f"下注: {opp['bet']} @ {opp['odds']*100:.0f}¢",
        "",
        f"📊 EV: {ev.ev_percent:+.1f}%",
        f"💰 建議: ${ev.bet_amount:.2f}",
        f"🎯 Edge 評分: {edge.total}/7",
        "",
        "傷病:",
    ]
    
    for i in opp["injuries"]["away"]:
        lines.append(f"   ❌ {i['player']} OUT")
    
    lines.extend([
        "",
        edge.recommendation
    ])
    
    return "\n".join(lines)

def main():
    if len(sys.argv) < 2:
        print("Usage: python main.py [scan|watch]")
        return
    
    command = sys.argv[1]
    
    if command == "scan":
        # 單次掃描
        opportunities = scan_opportunities()
        
        if opportunities:
            print(f"\n🔥 發現 {len(opportunities)} 個機會:")
            for opp in opportunities:
                print()
                print(format_opportunity(opp))
        else:
            print("\n❌ 沒有發現 +EV 機會")
    
    elif command == "watch":
        # 持續監控
        print(f"👀 開始監控 (每 {config.SCAN_INTERVAL//60} 分鐘)")
        while True:
            try:
                opportunities = scan_opportunities()
                
                if opportunities:
                    for opp in opportunities:
                        print(format_opportunity(opp))
                        # TODO: 發送 Telegram 通知
                
                time.sleep(config.SCAN_INTERVAL)
            except KeyboardInterrupt:
                print("\n停止監控")
                break
            except Exception as e:
                print(f"Error: {e}")
                time.sleep(60)
    
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()
