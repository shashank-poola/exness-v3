# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TradeX is a real-time cryptocurrency trading platform with live price feeds, candlestick charts, and order management. This is a Turborepo monorepo using Bun as the package manager, with multiple apps and shared packages.

## Development Commands

### Root-level Commands
- `bun install` - Install all dependencies across the monorepo
- `turbo dev` - Start all apps in development mode (parallel)
- `turbo build` - Build all apps
- `turbo lint` - Lint all apps
- `bun run format` - Format all files with Prettier

### Local Infrastructure
Start PostgreSQL and Redis (required before running any app):
```bash
docker compose up -d
```
MongoDB is **not** in the docker-compose file — it must be set up separately (used by the engine for snapshots).

### Database Commands (from packages/db)
- `cd packages/db && bunx prisma generate` - Generate Prisma Client
- `cd packages/db && bunx prisma migrate dev` - Run database migrations (development)
- `cd packages/db && bunx prisma migrate deploy` - Run database migrations (production)
- `cd packages/db && bunx prisma studio` - Open Prisma Studio GUI

### App-specific Commands

**Web (Frontend):**
```bash
cd apps/web
bun run dev        # Start Vite dev server (http://localhost:5173)
bun run build      # Build for production
bun run build:dev  # Build for development
bun run lint       # Run ESLint
```

**API (Backend):**
```bash
cd apps/api
bun run dev        # Start Express server with tsx watch (http://localhost:3000)
bun run build      # Compile TypeScript
bun run start      # Run compiled code
```

**Engine (Trading Logic):**
```bash
cd apps/engine
bun run dev        # Run with Bun watch mode
bun run start      # Run without watch
```

**Pooler (Price Feed):**
```bash
cd apps/pooler
bun run dev        # Run with Bun watch mode
bun run start      # Run without watch
```

**WS (WebSocket Server):**
```bash
cd apps/ws
bun run dev        # Start WebSocket server (ws://localhost:8080)
```

**Mobile (React Native/Expo):**
```bash
cd apps/mobile
bun run start      # Start Expo dev server
bun run android    # Start on Android
bun run ios        # Start on iOS
bun run lint       # Run ESLint
```

## Architecture

### High-Level Data Flow

1. **Price Discovery:**
   - `pooler` connects to Backpack Exchange WebSocket
   - Publishes price updates to Redis channel `ws:price:update` and Redis Stream `stream:engine`
   - Prices broadcast every 100ms

2. **Price Broadcasting:**
   - `ws` service subscribes to `ws:price:update` Redis channel
   - Broadcasts prices to all connected WebSocket clients

3. **Order Execution:**
   - `api` receives HTTP requests and pushes messages to Redis Stream `stream:engine`
   - `engine` consumes from Redis Stream, processes orders in-memory
   - `engine` checks stop-loss, take-profit, and liquidation conditions on every price update
   - `engine` acknowledges via Redis pub/sub channel `http:response`

4. **State Persistence:**
   - `engine` maintains in-memory state (`prices`, `users`) in `memoryDb.ts`
   - Snapshots saved to MongoDB every 15 seconds
   - On restart, `engine` restores snapshot and replays missed Redis Stream messages

### Service Communication

- **API → Engine:** Redis Streams (`stream:engine`)
- **Engine → API:** Redis Pub/Sub (`http:response:{requestId}`)
- **Pooler → WS:** Redis Pub/Sub (`ws:price:update`)
- **Pooler → Engine:** Redis Streams (`stream:engine`)
- **WS → Frontend/Mobile:** WebSocket connection

### Apps

**apps/api** - Express REST API
- Handles authentication (JWT + bcrypt)
- User creation, balance queries
- Order creation/closure requests
- Communicates with engine via Redis Streams and awaits acknowledgment via pub/sub

**apps/engine** - Trading Engine (Bun runtime)
- Consumes messages from Redis Stream `stream:engine`
- Maintains in-memory order book and user balances
- Processes price updates and triggers stop-loss/take-profit/liquidation
- Snapshots state to MongoDB every 15s for crash recovery
- Uses consumer groups for fault tolerance

**apps/pooler** - Price Feed Service (Bun runtime)
- Connects to Backpack Exchange WebSocket (`wss://ws.backpack.exchange/`)
- Subscribes to BTC_USDC, ETH_USDC, SOL_USDC book tickers
- Publishes to Redis channel `ws:price:update` and Redis Stream `stream:engine` every 100ms

**apps/ws** - WebSocket Server (Bun runtime)
- Subscribes to Redis channel `ws:price:update`
- Broadcasts price updates to connected clients
- Runs on port 8080 by default

**apps/web** - React Frontend (Vite + TypeScript)
- UI built with shadcn/ui (Radix UI + TailwindCSS)
- React Query for state management and API calls
- Lightweight Charts for candlestick visualization
- WebSocket client for real-time price feed
- In-memory price store (`price-store.ts`) for O(1) lookups
- In-memory candlestick store (`candlestick-store.ts`) for chart data

**apps/mobile** - React Native/Expo App
- Cross-platform mobile app for iOS/Android
- Uses Expo Router for navigation
- React Query for data fetching
- Similar architecture to web app

### Packages

**packages/db** - Prisma ORM
- PostgreSQL schema for `User` and `ExistingTrade` models
- Shared across `api` service
- Always run `bunx prisma generate` after schema changes

**packages/redis** - Redis Configuration
- Exports publisher, subscriber, and stream clients
- Used by `api`, `engine`, `pooler`, `ws`

**packages/ui** - Shared UI Components (future use)

**packages/eslint-config** - Shared ESLint configuration

**packages/typescript-config** - Shared TypeScript configuration

### Key Implementation Details

**In-Memory State Management:**
- The `engine` service maintains all active orders in memory (`memoryDb.ts`)
- Two main objects: `prices` (PriceStore) and `users` (UserStore)
- On every price update, the engine iterates through all open orders to check liquidation conditions

**Price Store (Web):**
- Frontend maintains in-memory price cache (`apps/web/src/lib/price-store.ts`)
- Updated via WebSocket messages
- Provides O(1) lookups for current prices
- Supports observer pattern for reactive updates

**Candlestick Store:**
- Frontend aggregates candlesticks from price ticks
- Maintains multiple timeframes (1m, 5m, 30m, 1h, 6h, 1d, 3d)
- Engine also maintains candlestick data for historical queries

**Request-Response Pattern (API ↔ Engine):**
- API generates unique `requestId` (UUID)
- Pushes message to `stream:engine` with `requestId`
- Subscribes to Redis channel `http:response:{requestId}`
- Engine processes message and publishes acknowledgment to that channel
- See `apps/api/src/services/engine.service.ts` and `apps/engine/src/utils/send-ack.ts`

**Order Lifecycle:**
1. User places order via API
2. API validates and forwards to engine via Redis Stream
3. Engine creates order in memory, decrements user balance
4. On every price update, engine checks stop-loss/take-profit/liquidation
5. If condition met, engine closes order, updates balance, saves to PostgreSQL
6. API queries open orders from engine via Redis Stream

**Snapshot/Restore:**
- Engine snapshots `prices` and `users` to MongoDB every 15s
- On restart, restores last snapshot
- Replays missed messages from Redis Stream using consumer group offset
- See `apps/engine/index.ts:restoreSnapshot()` and `replay()`

## Common Development Tasks

### Adding a New Cryptocurrency Pair
1. Update `apps/pooler/src/index.ts` WebSocket subscription to include new symbol
2. Update market lists in `apps/web` and `apps/mobile` constants

### Modifying Database Schema
1. Edit `packages/db/prisma/schema.prisma`
2. Run `cd packages/db && bunx prisma generate`
3. Run `cd packages/db && bunx prisma migrate dev --name your_migration_name`
4. Restart API service

### Adding New Order Types/Logic
1. Define message type in `apps/engine/src/types/handler.type.ts`
2. Add handler in `apps/engine/src/handler/order.handler.ts`
3. Add case in `apps/engine/src/handler/index.ts:processMessage()`
4. Update API service to send new message type

### Environment Variables

All apps require environment variables. See `.env.example` files in each app directory:
- `apps/api/.env` - DATABASE_URL, JWT_SECRET, REDIS_HOST, REDIS_PORT
- `apps/web/.env` - VITE_API_URL, VITE_WS_URL
- `apps/engine/.env` - REDIS_HOST, REDIS_PORT, MONGODB_URI
- `apps/pooler/.env` - REDIS_HOST, REDIS_PORT
- `apps/ws/.env` - WS_PORT, REDIS_HOST, REDIS_PORT
- `apps/mobile/.env` - EXPO_PUBLIC_API_URL, EXPO_PUBLIC_WS_URL

## Notes

- The engine uses **in-memory state** for performance; always consider snapshot/restore implications
- Price updates happen every 100ms; be mindful of performance in hot paths
- Redis Streams provide at-least-once delivery via consumer groups
- The API waits for engine acknowledgment before responding to clients
- All financial calculations use integer arithmetic to avoid floating-point precision issues (prices stored with decimal places as metadata)
- Stop-loss and take-profit are checked on **every price update**, not just on order creation
