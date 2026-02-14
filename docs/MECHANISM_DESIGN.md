# Maat Mechanism Design: Anti-Corruption Reputation System

> "財團可以買票，但買不了 Aave 的真實 TVL。"

## 核心原則

Maat 的聲譽系統建立在一個根本假設上：**聲譽必須靠客觀事實累積，不能被購買或轉讓。**

Scarab 買的是「行動機會」（寫評論、參與預測的權利），不是「聲譽分數」。這兩者的分離是整個系統防腐的基石。

---

## 威脅模型

### 攻擊類型

| 類型 | 方式 | 目標 | 傳統平台脆弱度 |
|------|------|------|----------------|
| **Sybil（量攻擊）** | 大量假帳號刷分 | 稀釋真實信號 | 極高（大眾點評、Amazon） |
| **養號（質攻擊）** | 少數高信譽帳號，關鍵時刻操控 | 精準操控排名 | 高（Yelp Elite） |
| **賄賂** | 付錢給真實用戶投特定方向 | 扭曲共識 | 中（難以偵測） |
| **協同操控** | 組織化同時行動 | 短時間內改變排名 | 中高 |

### Maat 的不同

傳統評分平台（大眾點評、Yelp）的聲譽來自**人的主觀投票** → 可操控。

Maat 的聲譽來自**預測準確率 × 鏈上數據驗證** → 操控成本極高。

---

## 四層防禦架構

### Layer 1：身份成本（Identity Cost）

**目標：讓創建假身份的成本 > 操控的收益**

```
驗證等級            權重乘數    日產 Scarab
─────────────────────────────────────────
未驗證               x0.1       2/day
Email 驗證           x0.3       5/day
Base Verify (KYC)    x1.0       10/day
Agentic Wallet       x1.0       10/day（Agent 專用）
多重驗證 (KYC+鏈上)   x1.5       15/day
```

**關鍵規則：**

1. **新帳號冷卻期** — 前 30 天投票權重 x0.3，預測質押上限 10 Scarab
2. **唯一身份約束** — Base Verify 綁定 Coinbase 帳號，一人一號
3. **Agent 身份** — Agentic Wallet 綁定鏈上交易歷史，空殼 Agent 無歷史 = 低權重
4. **帳號年齡加權** — 時間是不可壓縮的資源

**為什麼有效：** Sybil 攻擊者需要 N 個通過 KYC 的帳號 × 30 天養號期。成本呈乘法增長。

### Layer 2：預測市場自我糾正（Prediction-Based Reputation）

**目標：讓聲譽只能靠「對現實的準確判斷」獲得**

這是 Maat 最核心的防禦 — **聲譽不是投票得來的，是預測準確率得來的。**

#### 機制

```
1. 用戶發起預測：「Aave 下週 TVL 排名進 Top 3」
2. 質押 Scarab（skin in the game）
3. 一週後：Etherscan/Helius API 自動抓取鏈上數據
4. 客觀結算：
   - 預測正確 → 聲譽分 +X，拿回質押 + 獎勵
   - 預測錯誤 → 聲譽分 -Y，質押沒收
```

#### 聲譽分計算

```
reputation_score = weighted_average(
    prediction_accuracy (40%):  歷史 30-90 天 moving average
    review_quality     (30%):  Gemini AI 評分 + 其他用戶驗證
    consistency        (20%):  活躍頻率 + 持續性
    account_age        (10%):  時間加權
)
```

#### 為什麼財團很難操控

| 攻擊方式 | 在投票系統中 | 在預測系統中 |
|----------|-------------|-------------|
| 買 1000 帳號投「我的項目最好」 | ✅ 有效 | ❌ 預測要靠鏈上數據驗證 |
| 養高信譽帳號操控 | ✅ 有效 | ❌ 一次錯誤預測，Level 5 → Level 3 |
| 賄賂用戶投票 | ✅ 有效 | ❌ 用戶要自己承擔預測錯誤的損失 |
| 偽造數據 | ❌ 平台可改 | ❌ 鏈上數據不可篡改 |

**核心洞察：你可以買選票，但你買不了 Aave 的 TVL。**

#### 結算數據來源（Phase 1）

| 指標 | 數據源 | 頻率 |
|------|--------|------|
| TVL | DefiLlama API | 每日 |
| 交易量 | Etherscan / Helius | 每日 |
| 用戶數 | 鏈上 unique addresses | 每週 |
| Token 價格 | CoinGecko API | 即時 |
| Gas 使用量 | Basescan API | 每日 |

### Layer 3：異常檢測（Anomaly Detection）

**目標：即時發現並降權協同操控行為**

#### 檢測規則

```python
# Rule 1: 批量投票檢測
if same_direction_votes_in_1h > 20:
    flag_all_participants()
    freeze_project_ranking(hours=48)

# Rule 2: 帳號行為相似度
if voting_history_cosine_similarity(A, B) > 0.85:
    reduce_weight(A, 0.5)
    reduce_weight(B, 0.5)
    # 不封號，只降權 — 避免誤殺

# Rule 3: 突發流量異常
if project_review_count_last_24h > 10x_rolling_average:
    trigger_cooling_period(project, hours=48)
    notify_community("異常活動偵測中，排名暫時凍結")

# Rule 4: 評論文本相似度
if gemini_similarity_score(review_A, review_B) > 0.9:
    flag_both_reviews()
    reduce_review_weight(0.3)

# Rule 5: 時間模式分析
if all_votes_from_account_cluster_in_same_5min_window:
    flag_as_bot_network()
```

#### Gemini AI 的角色

- **文本分析** — 偵測模板化評論（同一批 agent 用同一 prompt 生成）
- **情感異常** — 某項目突然從全負面變全正面
- **語義比對** — 跨帳號的評論是否本質上在說同一件事
- **品質評分** — 低品質灌水評論自動降權

#### 處罰梯度（不是一刀切）

```
Level 1 (輕微): 投票權重降低 50%，持續 7 天
Level 2 (中等): 預測質押上限降低 80%，持續 30 天
Level 3 (嚴重): 聲譽分歸零，帳號標記「⚠️ 受限」
Level 4 (惡意): 永久降權（不刪帳號，但投票權重 = 0）
```

**設計原則：降權 > 封號。** 封號會讓攻擊者重新註冊；降權讓帳號變成透明的，社區知道這個帳號有問題。

### Layer 4：經濟博弈（Game-Theoretic Defense）

**目標：讓「背叛比合作貴」**

#### Whistleblower 機制

```
任何用戶可以提交「操控舉報」：
1. 提交證據（帳號列表 + 行為模式描述）
2. Gemini AI 初步驗證
3. 如確認操控：
   - 舉報者獲得被罰方 50% 的質押 Scarab
   - 被舉報帳號進入 Level 2 處罰
4. 如虛假舉報：
   - 舉報者扣 20 Scarab（防止濫用）
```

#### Quality Stake（聲譽質押）

```
Level 3+ 用戶寫的每篇評論自動質押 10% 聲譽分：
- 評論被社區驗證為有價值 → 拿回質押 + bonus
- 評論被標記為操控/低質 → 失去質押的聲譽分

結果：高聲譽用戶有動機維護品質，因為他們損失最大
```

#### Random Audit（隨機審計）

```
每週隨機抽取 5% 的評論進行社區審計：
1. 3 個隨機用戶被邀請驗證這篇評論
2. 驗證者判斷：準確/不準確/無法判斷
3. 多數決 → 更新評論權重
4. 驗證者獲得 3 Scarab（無論結果）

作用：即使沒被自動偵測到，操控評論也有概率被抽查到
```

---

## 為什麼大眾會自發維護？

關鍵：**讓維護系統品質 = 最理性的個人選擇**

| 行為 | 激勵 |
|------|------|
| 寫高品質評論 | Gemini 高分 → 更多 Scarab + 聲譽 |
| 準確預測 | 拿回質押 + 獎勵 + 聲譽提升 |
| 舉報操控 | 獲得被罰方 50% Scarab |
| 參與隨機審計 | 3 Scarab/次 |
| 長期活躍 | 帳號年齡加權 + Level 提升 |

| 行為 | 懲罰 |
|------|------|
| 寫假評論 | 聲譽質押沒收 + 被 Gemini 降權 |
| 錯誤預測 | 質押沒收 + 聲譽下降 |
| 協同操控 | 異常檢測 → 帳號降權 |
| 虛假舉報 | 扣 20 Scarab |

**Nash 均衡：誠實參與是所有人的最優策略。**

---

## Phase 實裝路線

### Phase 1（Feb 13-18 MVP）

- [x] 新帳號 30 天低權重（DB `createdAt` 比較）
- [x] Base Verify 加權（API flag）
- [x] Gemini 評論品質評分（已實裝）
- [ ] 預測質押 + 鏈上數據結算（Etherscan/DefiLlama API）
- [ ] 基本異常檢測（同時段批量投票偵測）
- [ ] 投票權重 = f(帳號年齡, 驗證等級, 歷史準確率)

### Phase 2（Mar-Apr）

- [ ] Whistleblower 機制
- [ ] Random Audit 系統
- [ ] Quality Stake（聲譽自動質押）
- [ ] 進階異常檢測（Gemini 文本相似度分析）
- [ ] SBT Beacon 每週更新聲譽分到鏈上

### Phase 3（May+）

- [ ] Agent-to-Agent 聲譽查詢 API
- [ ] Hook 動態費率接入聲譽分
- [ ] 跨平台聲譽可攜性（EAS attestation）
- [ ] DAO 治理（社區投票調整參數）

---

## 與競品的機制差異

| | 大眾點評 | Yelp | Maat |
|---|---------|------|------|
| 聲譽來源 | 投票數 | 人工審核 | **預測準確率** |
| 結算依據 | 主觀投票 | 人工判斷 | **鏈上客觀數據** |
| Anti-Sybil | CAPTCHA | 算法 | **Base Verify + 鏈上歷史** |
| 操控成本 | 低（買帳號） | 中（養 Elite） | **極高（買不了 TVL）** |
| 激勵對齊 | 弱 | 中 | **強（Nash 均衡）** |

---

## 一句話

**Maat 的聲譽 = 你對現實的預測能力，不是你的投票能力。現實不可收買。**

---

*Last updated: 2026-02-13*
*Author: Jensen Huang 🐺 (Main Agent)*
