"""
EV Calculator
計算預期價值和 Kelly 下注比例
"""

from dataclasses import dataclass
from typing import Optional

@dataclass
class EVResult:
    market_odds: float          # 市場賠率 (e.g., 0.59)
    estimated_prob: float       # 我們估計的真實勝率
    bet_amount: float           # 下注金額
    potential_profit: float     # 贏的利潤
    potential_loss: float       # 輸的損失
    ev: float                   # 期望值
    ev_percent: float           # EV 百分比
    kelly_fraction: float       # Kelly 建議比例
    recommendation: str         # 建議

def calculate_ev(
    market_odds: float,
    estimated_prob: float,
    bankroll: float,
    max_kelly: float = 0.3
) -> EVResult:
    """
    計算 EV 和 Kelly 下注
    
    Args:
        market_odds: Polymarket 賠率 (e.g., 0.59 for 59¢)
        estimated_prob: 我們估計的真實勝率 (e.g., 0.75 for 75%)
        bankroll: 當前資金
        max_kelly: Kelly 上限 (default 30%)
    
    Returns:
        EVResult with all calculations
    """
    # 基本計算
    implied_prob = market_odds
    
    # 如果我們買 YES:
    # 贏: 每 1¢ 變成 $1，利潤 = (1 - market_odds) / market_odds
    profit_per_dollar = (1 - market_odds) / market_odds
    
    # EV 計算
    # EV = P(win) * profit - P(lose) * loss
    ev_per_dollar = (estimated_prob * profit_per_dollar) - ((1 - estimated_prob) * 1)
    
    # Kelly Criterion
    # f* = (bp - q) / b
    # b = profit per $1 wagered
    # p = probability of winning
    # q = probability of losing
    b = profit_per_dollar
    p = estimated_prob
    q = 1 - p
    
    kelly = (b * p - q) / b if b > 0 else 0
    kelly = max(0, min(kelly, max_kelly))  # 限制在 0 到 max_kelly
    
    # 建議下注金額
    bet_amount = bankroll * kelly
    potential_profit = bet_amount * profit_per_dollar
    potential_loss = bet_amount
    
    # EV 金額
    ev = bet_amount * ev_per_dollar
    ev_percent = ev_per_dollar * 100
    
    # 建議
    if ev_percent > 20:
        recommendation = "✅ 強力推薦"
    elif ev_percent > 10:
        recommendation = "✅ 推薦"
    elif ev_percent > 5:
        recommendation = "⚠️ 考慮"
    elif ev_percent > 0:
        recommendation = "⚠️ 邊緣"
    else:
        recommendation = "❌ 不下"
    
    return EVResult(
        market_odds=market_odds,
        estimated_prob=estimated_prob,
        bet_amount=round(bet_amount, 2),
        potential_profit=round(potential_profit, 2),
        potential_loss=round(potential_loss, 2),
        ev=round(ev, 2),
        ev_percent=round(ev_percent, 1),
        kelly_fraction=round(kelly, 3),
        recommendation=recommendation
    )

def estimate_probability_with_injuries(
    base_prob: float,
    home_advantage: bool = False,
    star_injuries_home: int = 0,
    star_injuries_away: int = 0,
    recent_form_diff: float = 0  # 正數表示主隊近況較好
) -> float:
    """
    根據傷病和其他因素估計真實勝率
    
    Args:
        base_prob: 基礎勝率 (根據戰績)
        home_advantage: 是否有主場優勢
        star_injuries_home: 主隊明星傷病數
        star_injuries_away: 客隊明星傷病數
        recent_form_diff: 近況差異
    
    Returns:
        調整後的估計勝率
    """
    prob = base_prob
    
    # 主場優勢 +3%
    if home_advantage:
        prob += 0.03
    
    # 傷病調整 (每個明星 OUT 約 -8% 到 -15%)
    prob -= star_injuries_home * 0.10
    prob += star_injuries_away * 0.10
    
    # 近況調整
    prob += recent_form_diff * 0.02
    
    # 限制在合理範圍
    return max(0.1, min(0.95, prob))

def format_ev_report(result: EVResult) -> str:
    """
    格式化 EV 報告
    """
    return f"""
📊 EV 分析報告
━━━━━━━━━━━━━━━
市場賠率: {result.market_odds*100:.0f}¢
我的估計: {result.estimated_prob*100:.0f}%
━━━━━━━━━━━━━━━
EV: {result.ev_percent:+.1f}%
Kelly: {result.kelly_fraction*100:.1f}%
建議金額: ${result.bet_amount:.2f}
━━━━━━━━━━━━━━━
贏: +${result.potential_profit:.2f}
輸: -${result.potential_loss:.2f}
━━━━━━━━━━━━━━━
{result.recommendation}
"""

if __name__ == "__main__":
    # 測試: Pistons @ 59¢, 估計 75% 勝率, $33.65 bankroll
    result = calculate_ev(
        market_odds=0.59,
        estimated_prob=0.75,
        bankroll=33.65
    )
    print(format_ev_report(result))
