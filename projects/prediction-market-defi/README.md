# Prediction Market DeFi Derivatives

## 願景

建立預測市場的 DeFi 基礎設施層，讓用戶可以：
- 用各種資產抵押開預測倉位
- 讓閒置資金自動生息
- 獲得槓桿能力

## 核心產品

### 1. kUSDC（升息穩定幣）
- 用戶存 USDC → 得到 kUSDC
- 底層自動存入 Aave/Morpho 生息
- kUSDC 可用於預測市場下注

### 2. 抵押借貸
- 抵押品：BTC, ETH, 股票代幣, 預測市場倉位
- 借出：穩定幣 / kUSDC
- 用途：開預測市場倉位

### 3. 槓桿服務
- 短尾市場提供槓桿
- 放大收益（和風險）

## 目標市場

### 長尾市場（重點）
- 等待時間長（幾週～幾個月）
- 資金效率問題最明顯
- 例：NBA 總冠軍、電競世界賽、PTCG 評級

### 短尾市場
- 聚合現有市場
- 提供槓桿服務

## 獨立垂直：PTCG 預測市場

自己建的預測市場，專注：
- 卡牌評級預測（PSA/BGS）
- 卡牌價格走勢
- Meta 預測

## 技術棧

- **Uniswap v4 Hook** - 核心機制
- **Aave/Morpho** - 收益來源
- **預測市場合約** - 整合 Polymarket 等

## 時間線

- 2026/01/28: Maat hackathon 截止
- 2026/03 初: Hook Incubator（需要 Hook 專案）

## 研究資料

見 `research/` 目錄
