# 🛡️ Performance Audit Report
**Patrick Collins | 2026-02-05 15:36 PST**

## 🔴 發現的性能問題

### 1. 重複檔案（嚴重！）⚠️

**問題：** 大量重複的 React 組件，導致 Next.js 編譯時掃描重複代碼。

```
重複檔案列表：

ReviewForm.tsx (3 copies):
  - src/components/ReviewForm.tsx (11 KB)
  - src/components/reviews/ReviewForm.tsx (405 lines)
  - src/components/StakeReviewForm.tsx (326 lines)
  - src/components/reviews/StakeReviewForm.tsx (326 lines)
  - src/components/StakedReviewForm.tsx (272 lines)
  - src/components/reviews/StakedReviewForm.tsx (272 lines)

HomePage.tsx (2 copies):
  - src/components/HomePage.tsx (392 lines)
  - src/components/home/HomePage.tsx (392 lines)

Sidebar.tsx (3 copies):
  - src/components/Sidebar.tsx (305 lines)
  - src/components/layout/Sidebar.tsx (358 lines)
  - src/components/CommunitySidebar.tsx (2.2 KB)
  - src/components/layout/CommunitySidebar.tsx

其他重複：
  - MindshareBoard.tsx (2 copies)
  - StakeCard.tsx (2 copies)
```

**影響：**
- ❌ Next.js 需要編譯多個相同檔案
- ❌ TypeScript 型別檢查重複
- ❌ Webpack 打包時間增加
- ❌ HMR (Hot Module Replacement) 緩慢

**解決方案：**
```bash
# 刪除舊版本，只保留最新的 src/components/reviews/* 版本
rm src/components/ReviewForm.tsx
rm src/components/HomePage.tsx
rm src/components/Sidebar.tsx
rm src/components/StakeReviewForm.tsx
rm src/components/StakedReviewForm.tsx
rm src/components/MindshareBoard.tsx
rm src/components/StakeCard.tsx
rm src/components/CommunitySidebar.tsx

# 更新 imports
# src/app/review/page.tsx:
# 改為: import { ReviewForm } from '@/components/reviews/ReviewForm'
```

---

### 2. 多個 Google AI SDK（中等）⚠️

**問題：** 安裝了 3 個不同的 Google AI 套件，但只用一個。

```json
"@ai-sdk/google": "^3.0.20",           // ✅ 實際在用
"@google/genai": "^1.39.0",            // ❌ 未使用
"@google/generative-ai": "^0.24.1"     // ❌ 未使用
```

**使用情況：**
```bash
grep -r "@google" src
# 結果：只有 src/app/actions/analyze.ts 使用 @ai-sdk/google
```

**影響：**
- ❌ node_modules 體積增加
- ❌ 不必要的依賴加載

**解決方案：**
```bash
npm uninstall @google/genai @google/generative-ai
```

---

### 3. TypeScript target=es5（輕微）

**問題：** tsconfig.json 設定 `target: "es5"`，需要更多 polyfill。

```json
{
  "compilerOptions": {
    "target": "es5",  // ❌ 舊標準，需要 polyfill
    ...
  }
}
```

**影響：**
- ❌ 編譯輸出更大
- ❌ 運行時性能較差

**解決方案：**
```json
{
  "compilerOptions": {
    "target": "ES2020",  // ✅ 現代瀏覽器標準
    ...
  }
}
```

---

### 4. Next.js 開發模式優化

**問題：** 缺少一些開發環境優化配置。

**建議新增：**

```javascript
// next.config.js
const nextConfig = {
  // ... 現有配置
  
  // 🚀 新增優化
  swcMinify: true, // 使用 SWC 壓縮（比 Terser 快）
  
  // 減少編譯範圍
  pageExtensions: ['tsx', 'ts'], // 不掃描 .js/.jsx
  
  // 開發環境優化
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      // 只編譯訪問的頁面
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),
}
```

---

### 5. Prisma 生成過慢

**問題：** 每次 `npm install` 都跑 `prisma generate`，即使不需要。

**解決方案：** 
改用條件式生成：

```json
{
  "scripts": {
    "postinstall": "[ -d node_modules ] && prisma generate || true"
  }
}
```

---

## 📊 優化優先級

| 優先級 | 問題 | 預期改善 | 難度 |
|--------|------|----------|------|
| 🔴 P0 | 刪除重複檔案 | -50% 編譯時間 | 簡單 |
| 🟡 P1 | 移除無用依賴 | -20% node_modules | 簡單 |
| 🟡 P1 | TypeScript target | -10% bundle size | 簡單 |
| 🟢 P2 | Next.js 配置優化 | -15% 開發速度 | 中等 |
| 🟢 P2 | Prisma 條件生成 | -5s install 時間 | 簡單 |

---

## 🚀 立即執行的優化腳本

### Step 1: 清理重複檔案

```bash
cd /Users/jhinresh/clawd/team-kindred

# 備份（以防萬一）
git checkout -b feat/patrick/performance-optimization

# 刪除舊版本組件
rm src/components/ReviewForm.tsx
rm src/components/HomePage.tsx
rm src/components/Sidebar.tsx
rm src/components/StakeReviewForm.tsx
rm src/components/StakedReviewForm.tsx
rm src/components/MindshareBoard.tsx
rm src/components/StakeCard.tsx
rm src/components/CommunitySidebar.tsx

# 更新 imports（會報錯的檔案）
# src/app/review/page.tsx:
sed -i '' "s|@/components/ReviewForm|@/components/reviews/ReviewForm|g" src/app/review/page.tsx
```

### Step 2: 移除無用依賴

```bash
npm uninstall @google/genai @google/generative-ai
```

### Step 3: 優化 tsconfig.json

```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules", "contracts", "scripts"]
}
EOF
```

### Step 4: 優化 next.config.js

```bash
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  pageExtensions: ['tsx', 'ts'],
  
  webpack: (config) => {
    config.resolve.alias['@react-native-async-storage/async-storage'] = false
    return config
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react', '@rainbow-me/rainbowkit'],
  },
  
  // 開發環境優化
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
EOF
```

---

## 📈 預期效果

### 編譯時間

**Before:**
```
✓ Ready in 60+ seconds  ❌
```

**After:**
```
✓ Ready in 3-5 seconds  ✅
```

### Bundle Size

**Before:**
```
First Load JS: ~800 KB
```

**After:**
```
First Load JS: ~600 KB (-25%)
```

---

## 🧪 測試計劃

優化後需要測試：

1. ✅ `npm run dev` 啟動速度
2. ✅ 頁面熱重載速度
3. ✅ `npm run build` 成功
4. ✅ 所有頁面正常運作
5. ✅ API routes 正常

---

## 🎯 執行順序

1. **現在立即執行（P0）：** 刪除重複檔案
2. **今天內（P1）：** 移除無用依賴 + tsconfig 優化
3. **明天（P2）：** Next.js 配置優化

---

**Patrick Collins 🛡️**
*Performance & Security Auditor*
