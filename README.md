# Nail Salon App

美甲沙龍管理系統，包含服務預約、客戶管理、員工管理等功能。

## 專案架構

```
nail-app/
├── nail-salon-api/          # 後端 API 服務
├── sweet-service-picker/    # 前端：服務選擇介面
├── milk-tea-salon-manager/  # 前端：管理後台
└── CONNECTIONS.md           # 資料庫連線設定
```

## 技術棧

### 後端（nail-salon-api）
- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5.x
- **ORM**: Prisma 7.x
- **Database**: PostgreSQL (透過 pg adapter)
- **Auth**: JWT + bcrypt
- **Validation**: Zod

**主要套件**:
```json
{
  "@prisma/client": "^7.2.0",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.3",
  "bcrypt": "^6.0.0",
  "zod": "^4.3.5"
}
```

### 前端（sweet-service-picker & milk-tea-salon-manager）
- **Framework**: React 18.x + TypeScript
- **Build Tool**: Vite 5.x
- **UI Library**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Form**: React Hook Form + Zod

**主要套件**:
```json
{
  "react": "^18.3.1",
  "vite": "^5.4.19",
  "tailwindcss": "^3.4.17",
  "@tanstack/react-query": "^5.83.0",
  "react-router-dom": "^6.30.1",
  "react-hook-form": "^7.61.1",
  "zod": "^3.25.76"
}
```

## 快速啟動

### 1. 環境準備

#### 資料庫設定
本專案使用外部資料庫服務，詳見 [CONNECTIONS.md](./CONNECTIONS.md)。

**PostgreSQL 連線**:
```
Host: localhost:5432
User: postgres
Password: (無)
```

啟動資料庫容器（參考 database 專案）:
```bash
cd /path/to/database
./start.ps1
```

### 2. 後端啟動

```bash
cd nail-salon-api

# 安裝依賴
npm install

# 環境變數設定（創建 .env）
# DATABASE_URL=postgresql://postgres@localhost:5432/nail_salon
# JWT_SECRET=your_secret_key

# 執行 Prisma migration
npm run prisma:migrate

# 生成 Prisma Client
npm run prisma:generate

# 啟動開發伺服器
npm run dev
```

### 3. 前端啟動

#### sweet-service-picker（服務選擇介面）
```bash
cd sweet-service-picker
npm install
npm run dev
```

#### milk-tea-salon-manager（管理後台）
```bash
cd milk-tea-salon-manager
npm install
npm run dev
```

## API 路由

後端 API 主要路由：
- `/api/auth` - 認證相關（登入/註冊）
- `/api/services` - 服務管理
- `/api/staff` - 員工管理

## 開發指令

### 後端
```bash
npm run dev              # 開發模式（nodemon）
npm run build            # TypeScript 編譯
npm run start            # 執行編譯後的 JS
npm run prisma:generate  # 重新生成 Prisma Client
npm run prisma:migrate   # 執行資料庫 migration
```

### 前端
```bash
npm run dev          # 開發伺服器
npm run build        # 生產建置
npm run preview      # 預覽生產建置
npm run lint         # ESLint 檢查
```

## 資料庫

### 支援的資料庫服務
- **PostgreSQL**: 主資料庫
- **MongoDB**: NoSQL 儲存
- **Redis**: 快取層
- **ClickHouse**: 分析資料庫
- **MinIO**: S3 相容物件儲存
- **Milvus**: 向量資料庫

詳細連線資訊請參考 [CONNECTIONS.md](./CONNECTIONS.md)。

## License

ISC
