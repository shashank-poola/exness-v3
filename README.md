# TradeX - Cryptocurrency Trading Platform

A full-stack real-time cryptocurrency trading platform with live price feeds, candlestick charts, and order management.

## What Does This Do?

TradeX simulates a live crypto trading experience where users can:
- View real-time BTC, ETH, and SOL prices via WebSocket
- Place LONG/SHORT trades with up to 100x leverage
- Monitor positions with live P&L updates
- View interactive candlestick charts across multiple timeframes
- Manage trading history and balance

## System architecture
![Architecture](apps/web/src/assets/architecture.png)

## TradeX(Web)
![Exness-WEB](apps/web/src/assets/demo.png)

## TradeX(Mobile)
https://github.com/user-attachments/assets/a0c64dd7-5200-4fed-a5d0-146487eff85c


## Feature Overview

| Feature | Implementation | Details |
|---------|----------------|---------|
| **Real-time Price Feed** | Yes | WebSocket connection via `ws` service broadcasts live BTC, ETH, SOL prices from Backpack Exchange. Updates every 100ms. |
| **Interactive Charts** | Yes | Lightweight Charts library with 7 timeframes (1m, 5m, 30m, 1h, 6h, 1d, 3d). Green/red candlesticks for bullish/bearish moves. |
| **Order Management** | Yes | `createOrder()`, `closeOrder()`, `getOpenOrders()` hooks handle LONG/SHORT positions with real-time updates via React Query. |
| **Leverage Trading** | Yes | 1x to 100x leverage with visual slider. Margin calculation: `(quantity × price) / leverage`. |
| **JWT Authentication** | Yes | Secure signup/signin with bcrypt password hashing. JWT tokens in Authorization headers. |
| **Balance Tracking** | Yes | Real-time balance updates on order create/close. Displays available margin and locked funds. |
| **Order History** | Yes | Separate tabs for Open Orders (current positions) and All Orders (OPEN + CLOSED + CANCELLED). |
| **Price Store** | Yes | In-memory cache (`price-store.ts`) for O(1) price lookups. Updated by WebSocket messages. |
| **Redis Pub/Sub** | Yes | `ws` service publishes prices to Redis channel. Engine consumes via Redis Streams for order execution. |
| **Snapshot/Restore** | Yes | Engine dumps in-memory state to MongoDB every 15s. Replays missed messages on restart. |

## Tech Stack

**Frontend:**
- React + TypeScript
- TailwindCSS (dark mode)
- React Query (state management)
- Lightweight Charts TradingView(candlestick visualization)
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
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── .env.example
│       └── package.json
│
├── packages/
│   ├── db/                     # Shared database (Prisma)
│   │   ├── prisma/
│   │
│   ├── redis/                  # Redis configuration
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
bun install

# Setup environment files
cp apps/api/.env.example apps/api/.env
cp apps/engine/.env.example apps/engine/.env
cp apps/mobile/.env.example apps/mobile/.env
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
bun run dev

# Terminal 4: API (backend)
cd apps/api
bun run dev

# Terminal 5: Web (frontend)
cd apps/web
bun run dev
```

Frontend: http://localhost:5173
API: http://localhost:3000
WebSocket: ws://localhost:8080

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

## License

MIT

**Shashank Poola**
GitHub: [@shashank-poola](https://github.com/shashank-poola)
