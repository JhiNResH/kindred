"""
ESPN Injuries Scraper
抓取 NBA/NHL 傷病資訊
"""

import requests
from bs4 import BeautifulSoup
from dataclasses import dataclass
from typing import List, Dict, Optional
import re

@dataclass
class Injury:
    player: str
    team: str
    position: str
    status: str  # OUT, Day-To-Day, Questionable
    return_date: Optional[str]
    comment: str
    is_star: bool = False  # 是否為明星球員

# 明星球員列表 (影響比賽結果的關鍵球員)
NBA_STARS = [
    "LeBron James", "Stephen Curry", "Kevin Durant", "Giannis Antetokounmpo",
    "Nikola Jokic", "Joel Embiid", "Luka Doncic", "Jayson Tatum", "Devin Booker",
    "Ja Morant", "Anthony Davis", "Kyrie Irving", "Damian Lillard", "Jimmy Butler",
    "Kawhi Leonard", "Paul George", "Donovan Mitchell", "Trae Young", "Zion Williamson",
    "Anthony Edwards", "Tyrese Haliburton", "Darius Garland", "Evan Mobley",
    "Cade Cunningham", "Jalen Green", "Tyler Herro", "Bam Adebayo"
]

NHL_STARS = [
    "Connor McDavid", "Auston Matthews", "Nathan MacKinnon", "Nikita Kucherov",
    "David Pastrnak", "Leon Draisaitl", "Cale Makar", "Sidney Crosby",
    "Alex Ovechkin", "Igor Shesterkin", "Andrei Vasilevskiy"
]

def get_nba_injuries() -> Dict[str, List[Injury]]:
    """
    抓取 ESPN NBA 傷病報告
    Returns: {team_name: [Injury, ...]}
    """
    url = "https://www.espn.com/nba/injuries"
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching NBA injuries: {e}")
        return {}
    
    soup = BeautifulSoup(response.text, 'html.parser')
    injuries = {}
    
    # ESPN 傷病頁面結構解析
    # 需要根據實際 HTML 結構調整
    tables = soup.find_all('table')
    current_team = None
    
    for table in tables:
        # 找到球隊名稱
        team_header = table.find_previous(['h2', 'h3'])
        if team_header:
            current_team = team_header.get_text(strip=True)
            injuries[current_team] = []
        
        rows = table.find_all('tr')[1:]  # 跳過表頭
        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 4:
                player_name = cols[0].get_text(strip=True)
                position = cols[1].get_text(strip=True) if len(cols) > 1 else ""
                status = cols[3].get_text(strip=True) if len(cols) > 3 else ""
                comment = cols[4].get_text(strip=True) if len(cols) > 4 else ""
                
                injury = Injury(
                    player=player_name,
                    team=current_team or "Unknown",
                    position=position,
                    status=status,
                    return_date=None,
                    comment=comment,
                    is_star=player_name in NBA_STARS
                )
                if current_team:
                    injuries[current_team].append(injury)
    
    return injuries

def get_nhl_injuries() -> Dict[str, List[Injury]]:
    """
    抓取 ESPN NHL 傷病報告
    """
    url = "https://www.espn.com/nhl/injuries"
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching NHL injuries: {e}")
        return {}
    
    # 類似 NBA 的解析邏輯
    soup = BeautifulSoup(response.text, 'html.parser')
    injuries = {}
    # ... 實作類似 NBA 的解析
    
    return injuries

def get_team_star_injuries(team: str, sport: str = "nba") -> List[Injury]:
    """
    取得特定球隊的明星球員傷病
    """
    if sport == "nba":
        all_injuries = get_nba_injuries()
    else:
        all_injuries = get_nhl_injuries()
    
    team_injuries = all_injuries.get(team, [])
    return [i for i in team_injuries if i.is_star]

def get_todays_significant_injuries(sport: str = "nba") -> List[Dict]:
    """
    取得今天有重大影響的傷病 (明星球員 OUT)
    """
    if sport == "nba":
        injuries = get_nba_injuries()
        stars = NBA_STARS
    else:
        injuries = get_nhl_injuries()
        stars = NHL_STARS
    
    significant = []
    for team, team_injuries in injuries.items():
        for injury in team_injuries:
            if injury.is_star and injury.status.upper() == "OUT":
                significant.append({
                    "player": injury.player,
                    "team": team,
                    "status": injury.status,
                    "comment": injury.comment
                })
    
    return significant

if __name__ == "__main__":
    # 測試
    print("=== NBA 重大傷病 ===")
    sig = get_todays_significant_injuries("nba")
    for s in sig:
        print(f"⚠️ {s['player']} ({s['team']}) - {s['status']}")
