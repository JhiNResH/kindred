# STATUS.md — 單一資訊來源

> ⚠️ **所有 Agent 必讀！** 這是最新狀態，不要用過時資訊。
> 
> **最後更新:** 2026-02-02 00:05 PST (Kindred 產品定義完成)

---

## 🦞 KINDRED — 一週衝刺！

### 一句話介紹
> **"The Trust Layer for Everyone"**
> 
> Stake to review. Build reputation. Trade with trust.

### 核心決定 (2026-02-01/02)
- **品牌：Kindred** (Maat 合併進來，不再獨立)
- **Deadline：1 週內 ship**
- **Hackathon：Clawathon (OpenWork)**
- **評審：Grok (xAI) 決定名次**

### 連結
- **GitHub:** `openwork-hackathon/team-kindred`
- **Vercel:** `team-kindred.vercel.app`
- **Product Twitter:** @kindred_rone (Gary 運營)
- **Team Twitter:** @jh1nr3sh (Gary 運營)

---

## 🎯 產品定義

**Kindred = Trust Layer for DeFi**

```
評論平台（人 + Agent）
        ↓
    聲譽分數
        ↓
  Uniswap v4 Hook
        ↓
   保護交易/DeFi
        ↓
  去中心化電商（長期）
```

### 核心機制
1. **質押評論** — 質押 $OPENWORK 才能發評論
2. **評論代幣化** — 每條評論 mint 一個 NFT
3. **Upvote = 購買** — 買 NFT 表示認同該評論
4. **x402 付費牆** — 詳細內容需付費解鎖
5. **聲譽分數** — 基於評論表現計算
6. **Hook 保護** — 高聲譽 = 低費率，低聲譽 = 限制交易

### MVP 功能 (1 週內)
- ✅ 評論平台（Web3 項目）
- ✅ 質押 $OPENWORK 才能評論
- ✅ 評論 mint NFT，可被 upvote（購買）
- ✅ x402 付費看詳細內容
- ✅ 聲譽分數計算
- 🔮 Hook 整合（保護交易）

### 階段規劃
| Phase | 內容 |
|-------|------|
| Phase 1 | 評論區塊鏈項目 — 累積數據 |
| Phase 2 | Trust DEX — 有聲譽才能交易 |
| Phase 3 | 去中心化電商 / Web2 擴展 |

---

## 👥 團隊分工

| 角色 | Agent | 任務 |
|------|-------|------|
| PM | Jensen Huang 🐺 | 統籌、進度追蹤 |
| Frontend | Tim Cook 🏭 | UI 開發 |
| Backend | Steve Jobs 🍎 | 產品設計、後端 |
| Contract | Patrick Collins 🛡️ | Hook + 合約開發 |
| Growth | Gary Vee 📣 | Twitter 運營、行銷 |
| Economy | Warren Buffett 💰 | 經濟模型建議 |

---

## 📋 合約架構

```
contracts/
├── interfaces/
│   └── IReputationOracle.sol   ← 聲譽查詢接口
├── core/
│   ├── KindredHook.sol         ← Uniswap v4 Hook
│   └── ReputationOracle.sol    ← 聲譽計算
├── token/
│   └── ReviewNFT.sol           ← 評論 NFT
└── staking/
    └── StakingVault.sol        ← 質押合約
```

---

## ⏰ Deadlines

| 日期 | 事件 | 緊急度 |
|------|------|--------|
| **~2026-02-09** | Clawathon MVP 完成 | 🔴 最高 |
| **3 月中** | 大 Hookathon 截止 | 🔴 |
| 8 月前 | 找到工作（備案） | 🟡 |

---

## 📝 開發規範

### Commit 格式（原子 Commit）
```
feat: add staking contract
fix: reputation calculation bug
docs: update README
refactor: extract oracle interface
test: add hook unit tests
```

一個 commit 只做一件事 ✅

---

*更新後請 commit: `git commit -m "status: [描述]"`*
