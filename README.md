# TradeX - Cryptocurrency Trading Platform

A full-stack real-time cryptocurrency trading platform with live price feeds, candlestick charts, and order management.

## What Does This Do?

TradeX simulates a live crypto trading experience where users can:
- View real-time BTC, ETH, and SOL prices via WebSocket
- Place LONG/SHORT trades with up to 100x leverage
- Monitor positions with live P&L updates
- View interactive candlestick charts across multiple timeframes
- Manage trading history and balance

## Feature Overview

| Feature | Implementation | Details |
|---------|----------------|---------|
| **Real-time Price Feed** | Yes | WebSocket connection via `ws` service broadcasts live BTC, ETH, SOL prices from Backpack Exchange. Updates every 100ms. |
| **Interactive Charts** | Yes | Lightweight Charts library with 7 timeframes (1m, 5m, 30m, 1h, 6h, 1d, 3d). Green/red candlesticks for bullish/bearish moves. |
| **Order Management** | Yes | `createOrder()`, `closeOrder()`, `getOpenOrders()` hooks handle LONG/SHORT positions with real-time updates via React Query. |
| **Leverage Trading** | Yes | 1x to 100x leverage with visual slider. Margin calculation: `(quantity × price) / leverage`. |
| **Dark/Light Theme** | Yes | Full UI theme support using TailwindCSS `dark:` variants. Theme persisted to localStorage. Logo swaps (black/white) automatically. |
| **Persistent State** | Yes | Candlestick data saved to localStorage every 5 seconds (throttled). Auto-loads on page refresh. |
| **Auto-reconnection** | Yes | WebSocket handles `visibilitychange` events. Reconnects on laptop sleep/wake, network interruptions. |
| **JWT Authentication** | Yes | Secure signup/signin with bcrypt password hashing. JWT tokens in Authorization headers. |
| **Balance Tracking** | Yes | Real-time balance updates on order create/close. Displays available margin and locked funds. |
| **Order History** | Yes | Separate tabs for Open Orders (current positions) and All Orders (OPEN + CLOSED + CANCELLED). |
| **Price Store** | Yes | In-memory cache (`price-store.ts`) for O(1) price lookups. Updated by WebSocket messages. |
| **Candlestick Builder** | Yes | `candlestick-store.ts` processes price ticks into OHLC data across all timeframes simultaneously. |
| **Redis Pub/Sub** | Yes | `ws` service publishes prices to Redis channel. Engine consumes via Redis Streams for order execution. |
| **Snapshot/Restore** | Yes | Engine dumps in-memory state to MongoDB every 15s. Replays missed messages on restart. |
| **Responsive UI** | Yes | Fixed-height orders section with scroll. Chart never shrinks when orders increase. |

## Tech Stack

**Frontend:**
- React + TypeScript
- TailwindCSS (dark mode)
- React Query (state management)
- Lightweight Charts (candlestick visualization)
- WebSocket (real-time data)

**Backend:**
- Node.js + Express
- PostgreSQL (users, orders)
- Prisma ORM
- JWT + bcrypt
- WebSocket server

**Infrastructure:**
- Redis (pub/sub, streams)
- MongoDB (snapshots)
- Turborepo (monorepo)

## Project Structure

```
exness-v3/
├── apps/
│   ├── api/                    # REST API service (Node.js + Express)
│   │   ├── src/
│   │   │   ├── controller/     # Request handlers
│   │   │   ├── middleware/     # Auth, validation
│   │   │   ├── routes/         # API routes
│   │   │   └── index.ts        # Server entry
│   │   ├── .env.example
│   │   └── package.json
│   │
│   ├── engine/                 # Trading engine (Bun runtime)
│   │   ├── src/
│   │   │   ├── index.ts        # Engine logic
│   │   │   └── types.ts
│   │   ├── .env.example
│   │   └── package.json
│   │
│   ├── pooler/                 # Price feed service (Bun runtime)
│   │   ├── src/
│   │   │   └── index.ts        # WebSocket client
│   │   ├── .env.example
│   │   └── package.json
│   │
│   ├── ws/                     # WebSocket server (Node.js)
│   │   ├── src/
│   │   │   └── index.ts        # WebSocket broadcast server
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── web/                    # Frontend (React + TypeScript)
│       ├── src/
│       │   ├── components/     # React components
│       │   │   ├── ui/         # Shadcn UI components
│       │   │   └── TradingChart.tsx
│       │   ├── contexts/       # React contexts (Theme)
│       │   ├── hooks/          # Custom hooks
│       │   │   ├── useAuth.ts
│       │   │   ├── useTrade.ts
│       │   │   └── useWebSocket.ts
│       │   ├── lib/            # Utilities
│       │   │   ├── axios.ts
│       │   │   ├── candlestick-store.ts
│       │   │   └── price-store.ts
│       │   ├── pages/          # Page components
│       │   │   ├── AuthPage.tsx
│       │   │   ├── LandingPage.tsx
│       │   │   ├── TradingPage.tsx
│       │   │   └── DocsPage.tsx
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── .env.example
│       └── package.json
│
├── packages/
│   ├── db/                     # Shared database (Prisma)
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database schema
│   │   └── package.json
│   │
│   ├── redis/                  # Redis client wrapper
│   │   ├── src/
│   │   │   └── index.ts        # Redis pub/sub, streams
│   │   └── package.json
│   │
│   └── ui/                     # Shared UI components
│       └── package.json
│
├── turbo.json                  # Turborepo config
├── package.json                # Root package.json
└── pnpm-workspace.yaml         # Workspace config
```

## Quick Start

### Prerequisites

- Node.js ≥ 20.x
- Bun ≥ 1.0
- PostgreSQL ≥ 15.x
- Redis ≥ 7.x
- MongoDB ≥ 6.x
- pnpm ≥ 8.x

### Installation

```bash
# Clone repository
git clone https://github.com/shashank-poola/exness-v3.git
cd exness-v3

# Install dependencies
pnpm install

# Setup environment files
cp apps/api/.env.example apps/api/.env
cp apps/engine/.env.example apps/engine/.env
cp apps/pooler/.env.example apps/pooler/.env
cp apps/web/.env.example apps/web/.env

# Configure databases in .env files

# Run migrations
cd packages/db
bunx prisma generate
bunx prisma migrate deploy
cd ../..
```

### Running the App

Run in separate terminals:

```bash
# Terminal 1: Pooler (price feed)
cd apps/pooler
bun run dev

# Terminal 2: Engine (trading logic)
cd apps/engine
bun run dev

# Terminal 3: WebSocket server
cd apps/ws
npm run dev

# Terminal 4: API (backend)
cd apps/api
bun run dev

# Terminal 5: Web (frontend)
cd apps/web
npm run dev
```

Frontend: http://localhost:5173
API: http://localhost:3000
WebSocket: ws://localhost:8080

## API Endpoints

### Authentication

**Signup**
```http
POST /api/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": { "id": "...", "email": "...", "balance": 5000 },
  "token": "eyJhbGc..."
}
```

**Signin**
```http
POST /api/v1/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": { ... },
  "token": "eyJhbGc..."
}
```

### Trading

**Create Order**
```http
POST /api/v1/trade/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "asset": "BTC_USDC",
  "side": "LONG",
  "quantity": 0.02,
  "leverage": 10,
  "tradeOpeningPrice": 91780.80,
  "slippage": 1
}

Response:
{
  "message": "Order placed",
  "trade": { "id": "...", "asset": "BTC_USDC", ... }
}
```

**Get Open Orders**
```http
GET /api/v1/trade/get-open-orders
Authorization: Bearer <token>

Response:
{
  "orders": [
    { "id": "...", "asset": "BTC_USDC", "side": "LONG", ... }
  ]
}
```

**Get Closed Orders**
```http
GET /api/v1/trade/get-close-orders
Authorization: Bearer <token>

Response:
{
  "orders": [
    { "id": "...", "status": "CLOSED", "pnl": 37.50, ... }
  ]
}
```

**Close Order**
```http
POST /api/v1/trade/close-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "uuid-here"
}

Response:
{
  "message": "Order closed"
}
```

### Balance

**Get Balance**
```http
GET /api/v1/balance/me
Authorization: Bearer <token>

Response:
{
  "balance": 8053.60
}
```

## Environment Variables

**apps/api/.env**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/tradex"
JWT_SECRET="your-secret-key"
PORT=3000
REDIS_HOST="localhost"
REDIS_PORT=6379
```

**apps/web/.env**
```env
VITE_API_URL="http://localhost:3000"
VITE_WS_URL="ws://localhost:8080"
```

## Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  balance   Balance?
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Balance {
  id      String @id @default(uuid())
  balance Float  @default(10000)
  user    User   @relation(fields: [userId], references: [id])
  userId  String @unique
}

model Order {
  id              String   @id @default(uuid())
  asset           String
  side            String
  quantity        Float
  leverage        Int
  openPrice       Float?
  closePrice      Float?
  stopLoss        Float?
  takeProfit      Float?
  slippage        Float
  status          String   @default("OPEN")
  pnl             Float?
  user            User     @relation(fields: [userId], references: [id])
  userId          String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## License

MIT

## Author

**Shashank Poola**
GitHub: [@shashank-poola](https://github.com/shashank-poola)
