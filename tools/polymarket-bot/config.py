"""
Configuration for Polymarket Bot
"""

# 資金管理
BANKROLL = 23.66  # 當前資金
MAX_KELLY = 0.30  # Kelly 上限 30%
MAX_DAILY_BETS = 3  # 每日最多下注數

# EV 標準
MIN_EV_PERCENT = 10  # 最低 EV 要求 (%)
MIN_EDGE_SCORE = 4   # 最低 Edge 評分

# 通知設定
TELEGRAM_CHAT_ID = "-1003723685993"
TELEGRAM_TOPIC_ID = "43"

# API URLs
ESPN_NBA_INJURIES = "https://www.espn.com/nba/injuries"
ESPN_NHL_INJURIES = "https://www.espn.com/nhl/injuries"
ESPN_NBA_SCOREBOARD = "https://www.espn.com/nba/scoreboard"
POLYMARKET_NBA = "https://polymarket.com/sports/nba/games"
POLYMARKET_NHL = "https://polymarket.com/sports/nhl"

# 掃描間隔 (秒)
SCAN_INTERVAL = 1800  # 30 分鐘

# 明星球員 (傷病會顯著影響比賽)
NBA_IMPACT_PLAYERS = {
    # Tier 1: MVP 級別 (單人影響 ~15%)
    "tier1": [
        "Nikola Jokic", "Giannis Antetokounmpo", "Luka Doncic", 
        "Joel Embiid", "Stephen Curry", "LeBron James"
    ],
    # Tier 2: All-Star 級別 (單人影響 ~10%)
    "tier2": [
        "Kevin Durant", "Jayson Tatum", "Anthony Davis", "Devin Booker",
        "Donovan Mitchell", "Ja Morant", "Trae Young", "Anthony Edwards",
        "Tyrese Haliburton", "Cade Cunningham", "Kyrie Irving"
    ],
    # Tier 3: 重要球員 (單人影響 ~5-8%)
    "tier3": [
        "Darius Garland", "Evan Mobley", "Tyler Herro", "Jalen Green",
        "Paul George", "Jimmy Butler", "Damian Lillard", "Bam Adebayo"
    ]
}

# 勝率調整參數
INJURY_IMPACT = {
    "tier1": 0.15,  # Tier 1 球員 OUT 影響 15%
    "tier2": 0.10,  # Tier 2 球員 OUT 影響 10%
    "tier3": 0.06   # Tier 3 球員 OUT 影響 6%
}

HOME_ADVANTAGE = 0.03  # 主場優勢 3%
