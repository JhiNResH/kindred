---
name: driver
description: This skill should be used when the agent "運將" is active. Provides Pincher Web3 carpooling platform development guidance, smart contract design patterns, and user experience optimization for ride-sharing on blockchain.
version: 0.1.0
---

# 🚗 運將 - Pincher Web3 Carpooling Platform

開發 Pincher，一個基於區塊鏈的拼車平台。

## 項目概述

**名稱：** Pincher
**定位：** Web3 拼車平台
**願景：** 去中心化的共乘經濟，司機和乘客直接連接

### 核心價值

```
傳統拼車（Uber Pool）:
❌ 平台抽成 25-30%
❌ 中心化定價
❌ 司機沒有議價權

Pincher:
✅ 低抽成 (5-10%)
✅ 智能合約託管
✅ P2P 直接配對
✅ 司機設定價格
```

## 技術棧（規劃）

| 組件 | 技術選擇 |
|------|----------|
| 智能合約 | Solidity |
| 鏈 | Base / Polygon |
| 前端 | React + TypeScript |
| Auth | Privy |
| 地圖 | Google Maps API |
| 後端 | Supabase |

## 核心功能

### 1. 行程發布

**司機端：**
```
- 設定出發點、目的地
- 設定出發時間
- 設定座位數
- 設定每人價格
- 發布到合約
```

**乘客端：**
```
- 搜尋路線
- 查看可用行程
- 預訂座位
- 支付（鏈上）
```

### 2. 智能合約託管

```solidity
// 核心流程
1. 乘客預訂 → 資金鎖定在合約
2. 司機確認上車 → 等待狀態
3. 乘客確認下車 → 資金釋放給司機
4. 爭議 → 仲裁機制
```

### 3. 信譽系統

```
司機評分：準時、安全、乾淨
乘客評分：準時、禮貌、付款
評分上鏈（SBT 或 attestation）
```

## 合約設計（初步）

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PincherRide {
    struct Ride {
        address driver;
        string origin;
        string destination;
        uint256 departureTime;
        uint256 pricePerSeat;
        uint8 availableSeats;
        uint8 bookedSeats;
        RideStatus status;
    }
    
    struct Booking {
        address passenger;
        uint256 rideId;
        uint8 seats;
        BookingStatus status;
    }
    
    enum RideStatus { Open, InProgress, Completed, Cancelled }
    enum BookingStatus { Pending, Confirmed, Completed, Disputed }
    
    mapping(uint256 => Ride) public rides;
    mapping(uint256 => Booking[]) public rideBookings;
    
    // 發布行程
    function postRide(
        string calldata origin,
        string calldata destination,
        uint256 departureTime,
        uint256 pricePerSeat,
        uint8 seats
    ) external returns (uint256 rideId);
    
    // 預訂座位（乘客付款）
    function bookRide(uint256 rideId, uint8 seats) external payable;
    
    // 確認上車
    function confirmPickup(uint256 rideId, address passenger) external;
    
    // 確認下車（釋放資金）
    function confirmDropoff(uint256 rideId, address passenger) external;
    
    // 爭議仲裁
    function raiseDispute(uint256 rideId, uint256 bookingId) external;
}
```

## 用戶體驗設計

### 司機流程

```
1. 連接錢包
2. 驗證身份（駕照、車輛）
3. 發布行程
4. 接受預訂
5. 完成行程
6. 收到付款
```

### 乘客流程

```
1. 連接錢包
2. 搜尋行程
3. 選擇並預訂
4. 付款（鏈上）
5. 等待司機確認
6. 完成行程
7. 評價
```

## 商業模式

```
收入來源：
- 平台手續費：5-10%（vs Uber 25-30%）
- Premium 功能
- 廣告（可選）

成本：
- 開發維護
- 鏈上 gas（由用戶支付）
- 營銷
```

## 競爭分析

| | Uber/Lyft | Pincher |
|---|-----------|---------|
| 抽成 | 25-30% | 5-10% |
| 定價 | 平台決定 | 司機決定 |
| 支付 | 法幣 | Crypto |
| 數據 | 平台擁有 | 用戶擁有 |
| 信任 | 中心化 | 鏈上記錄 |

## MVP 範圍

**Phase 1（MVP）：**
- [ ] 司機發布行程
- [ ] 乘客搜尋預訂
- [ ] 智能合約託管
- [ ] 基本 UI

**Phase 2：**
- [ ] 信譽系統
- [ ] 即時配對
- [ ] 地圖整合

**Phase 3：**
- [ ] 跨城拼車
- [ ] 企業服務
- [ ] 代幣經濟

## 風格指南

**我是運將，我的風格：**
- 實用主義
- 關注用戶需求
- 不過度工程
- 快速迭代

**開發原則：**
- 先跑起來，再優化
- 用戶反饋驅動
- Gas 效率很重要
- 安全第一

## 資料存放

```
~/clawd/projects/pincher/
├── contracts/        # 智能合約
├── frontend/         # React 前端
├── docs/            # 文檔
└── notes.md         # 開發筆記
```

## 待研究

- [ ] 如何處理鏈下路線匹配
- [ ] 隱私保護（不暴露真實位置）
- [ ] 法規合規（各地不同）
- [ ] 跨鏈支付
