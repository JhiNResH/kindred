"""
Edge Scorer
評估下注機會的 edge 強度
"""

from dataclasses import dataclass
from typing import List, Optional

@dataclass
class EdgeScore:
    injury_score: int       # 0-3: 傷病優勢
    value_score: int        # 0-2: 價值優勢
    home_score: int         # 0-1: 主場優勢
    form_score: int         # 0-1: 近況優勢
    total: int              # 總分
    details: List[str]      # 評分細節
    recommendation: str     # 建議

def score_opportunity(
    # 傷病
    star_injuries_opponent: int = 0,
    star_injuries_team: int = 0,
    
    # 價值
    market_odds: float = 0.5,
    estimated_prob: float = 0.5,
    
    # 主場
    is_home: bool = False,
    
    # 近況 (L10 勝率)
    team_l10_wins: int = 5,
    opponent_l10_wins: int = 5,
) -> EdgeScore:
    """
    評估機會的 edge 分數
    
    Returns:
        EdgeScore with total score and details
    """
    details = []
    
    # 1. 傷病分數 (0-3)
    injury_diff = star_injuries_opponent - star_injuries_team
    if injury_diff >= 2:
        injury_score = 3
        details.append(f"傷病: +3 (對手缺 {star_injuries_opponent} 明星)")
    elif injury_diff == 1:
        injury_score = 2
        details.append(f"傷病: +2 (對手缺 {star_injuries_opponent} 明星)")
    elif injury_diff > 0:
        injury_score = 1
        details.append(f"傷病: +1 (輕微傷病優勢)")
    else:
        injury_score = 0
        details.append("傷病: 0 (無優勢)")
    
    # 2. 價值分數 (0-2)
    edge = estimated_prob - market_odds
    if edge >= 0.15:
        value_score = 2
        details.append(f"價值: +2 (市場低估 {edge*100:.0f}%)")
    elif edge >= 0.08:
        value_score = 1
        details.append(f"價值: +1 (市場低估 {edge*100:.0f}%)")
    else:
        value_score = 0
        details.append("價值: 0 (價格公平)")
    
    # 3. 主場分數 (0-1)
    if is_home:
        home_score = 1
        details.append("主場: +1")
    else:
        home_score = 0
        details.append("主場: 0 (客場)")
    
    # 4. 近況分數 (0-1)
    form_diff = team_l10_wins - opponent_l10_wins
    if form_diff >= 2:
        form_score = 1
        details.append(f"近況: +1 (L10: {team_l10_wins}-{10-team_l10_wins} vs {opponent_l10_wins}-{10-opponent_l10_wins})")
    else:
        form_score = 0
        details.append("近況: 0 (差不多)")
    
    # 總分
    total = injury_score + value_score + home_score + form_score
    
    # 建議
    if total >= 6:
        recommendation = "🔥 強力下注"
    elif total >= 4:
        recommendation = "✅ 推薦下注"
    elif total >= 3:
        recommendation = "⚠️ 考慮下注"
    else:
        recommendation = "❌ 不建議"
    
    return EdgeScore(
        injury_score=injury_score,
        value_score=value_score,
        home_score=home_score,
        form_score=form_score,
        total=total,
        details=details,
        recommendation=recommendation
    )

def format_edge_report(score: EdgeScore, team: str, opponent: str) -> str:
    """
    格式化 Edge 報告
    """
    lines = [
        f"🎯 Edge 分析: {team} vs {opponent}",
        "━━━━━━━━━━━━━━━━━━━━━"
    ]
    
    for detail in score.details:
        lines.append(f"  {detail}")
    
    lines.extend([
        "━━━━━━━━━━━━━━━━━━━━━",
        f"總分: {score.total}/7",
        f"{score.recommendation}"
    ])
    
    return "\n".join(lines)

if __name__ == "__main__":
    # 測試: Pistons vs Suns (Booker + Green OUT)
    score = score_opportunity(
        star_injuries_opponent=2,  # Booker + Green
        star_injuries_team=0,
        market_odds=0.59,
        estimated_prob=0.75,
        is_home=True,
        team_l10_wins=8,
        opponent_l10_wins=6
    )
    print(format_edge_report(score, "Pistons", "Suns"))
