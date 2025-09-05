## Crypto Trading System

This project implements a modular trading system that integrates with **Backpack Exchange** via WebSocket. The architecture is designed around a **poller**, **queue**, and **execution engine**, providing a scalable and reliable way to handle real-time market data and trading operations.

---

## System Architecture

The system is composed of the following core components:

### 1. Backpack (Exchange Data Source)
- Source of live cryptocurrency market data via WebSocket.
- Provides price feeds, order book updates, and trade execution results.
- Data of SOL, BTC, ETH.

### 2. Poller
- Subscribes to Backpack WebSocket channels.
- Normalizes and forwards market data/events into the system.
- Pushes processed events into the **queue**.

### 3. Queue
- Message queue for decoupling data ingestion and processing.
- Ensures reliable communication between the **Poller**, **Engine**, and **Backend**.
- Supports horizontal scaling.

### 4. Engine
- Core trading logic and order execution.
- Consumes messages from the queue.
- Maintains system state:
  - **Balances**
  - **Open Orders**
  - **Closed Orders**
- Processes:
  - Trade creation
  - Trade closing
  - Balance updates
  - Exisiting balance

### 5. Backend (REST API Layer)
Provides REST APIs for client interaction:

- **Authentication**
  - `POST /api/v1/signup`
  - `POST /api/v1/signin`
  - `GET /api/v1/signin/post?token=123`

- **Trading**
  - `POST /api/v1/trade/create`
  - `POST /api/v1/trade/close`

- **Balances**
  - `GET /api/v1/balance/usd`
  - `GET /api/v1/balance/`

- **Assets**
  - `GET /api/v1/supportedAssets`

---

## Data Flow

1. **Backpack** streams market data →  
2. **Poller** receives and pushes normalized events into the **Queue** →  
3. **Engine** consumes queue messages, updates balances/open orders, and executes logic →  
4. **Backend** APIs expose system state and allow trade operations.  

---

## Technology Stack

- **Node.js / Typescript** (customizable for poller, engine, backend)
- **WebSockets** for live market data from backpack.
- **Message Queue** (e.g., Redis, Kafka)
- **REST APIs** (Express.js, FastAPI, or similar)
- **Database** (PostgreSQL / Prisma)

---

## Setup & Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shashank-poola/contest-super30.git
   cd contest-super30
   ```
