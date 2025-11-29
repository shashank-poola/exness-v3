import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logoImage from "@/assets/logo.png";

const DocsPage = () => {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Navigation */}
      <nav className="px-6 lg:px-12 py-6 bg-black rounded-b-3xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <img src={logoImage} alt="TradeX" className="h-10 transition-transform group-hover:scale-105" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className="text-sm font-medium text-white hover:opacity-70 transition-opacity"
              >
                HOME
              </Link>
              <Link
                to="/docs"
                className="text-sm font-medium text-white hover:opacity-70 transition-opacity"
              >
                DOCS
              </Link>
              <Link
                to="/trade"
                className="text-sm font-medium text-white hover:opacity-70 transition-opacity"
              >
                TRADE
              </Link>
            </div>

            <Button
              asChild
              className="rounded-full px-8 h-11 bg-white text-black hover:bg-gray-100 font-semibold text-sm"
            >
              <Link to="/signin">LOGIN</Link>
            </Button>
          </div>
        </div>
      </nav>
      
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-16 text-center">
          <h1 className="text-6xl font-bold mb-6" style={{ fontFamily: 'Instrument Serif, serif' }}>
            TradeX Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Production-grade, event-driven microservices architecture for high-frequency cryptocurrency trading with real-time market data.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Architecture Overview */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4">Architecture Overview</h2>
            <p className="text-gray-700 mb-6 text-lg">
              TradeX is built on a microservices architecture with event-driven communication using Redis Streams.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Service Components</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Pooler Service (Bun):</strong> WebSocket client for real-time price data from Backpack Exchange</li>
                  <li>• <strong>Engine Service (Bun):</strong> In-memory order execution with O(1) lookups for sub-millisecond trades</li>
                  <li>• <strong>API Service (Node.js):</strong> REST endpoints with JWT authentication and request validation</li>
                  <li>• <strong>WebSocket Server:</strong> Real-time price broadcasting to connected clients</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Key Features */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Event-Driven Communication</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Services communicate via Redis Streams</li>
                  <li>• Decoupled architecture for independent scaling</li>
                  <li>• Message persistence for reliability and replay</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">In-Memory Trading Engine</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• All active state stored in RAM</li>
                  <li>• O(1) lookups for fast execution</li>
                  <li>• Snapshots to MongoDB every 15s</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Technology Stack */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4">Technology Stack</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Backend</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Bun:</strong> High-performance runtime for Engine/Pooler</li>
                  <li>• <strong>Node.js:</strong> API service with Express.js</li>
                  <li>• <strong>TypeScript:</strong> Type-safe development</li>
                  <li>• <strong>Prisma ORM:</strong> Database migrations and queries</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Infrastructure</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>PostgreSQL:</strong> User accounts and closed trades</li>
                  <li>• <strong>MongoDB:</strong> Engine state snapshots</li>
                  <li>• <strong>Redis:</strong> Streams and Pub/Sub messaging</li>
                  <li>• <strong>Turborepo:</strong> Monorepo orchestration</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Trading Features */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4">Trading Features</h2>
            <div className="space-y-4">
              <ul className="space-y-3 text-gray-700 text-lg">
                <li>• <strong>Leverage Trading:</strong> 1x to 100x position multiplier</li>
                <li>• <strong>Real-time Charts:</strong> TradingView powered analytics</li>
                <li>• <strong>Demo Balance:</strong> Start with $10,000 virtual USD</li>
                <li>• <strong>Multiple Assets:</strong> BTC_USDC, ETH_USDC, SOL_USDC</li>
                <li>• <strong>Price Updates:</strong> Real-time data every 100ms</li>
                <li>• <strong>Advanced Orders:</strong> Market orders with slippage protection</li>
              </ul>
            </div>
          </Card>

          {/* API Endpoints */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4">API Endpoints</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Authentication</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm font-mono">
                  <div>POST /api/v1/signup - Create account</div>
                  <div>POST /api/v1/login - Get JWT token</div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Trading</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm font-mono">
                  <div>POST /api/v1/trade/create - Open position</div>
                  <div>POST /api/v1/trade/close - Close position</div>
                  <div>GET /api/v1/trade/open - Get active positions</div>
                  <div>GET /api/v1/trade/closed - Get trade history</div>
                  <div>GET /api/v1/balance - Check account balance</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Performance */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4">Performance Metrics</h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-black mb-2">~200</div>
                <p className="text-gray-600">Orders/Second</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-black mb-2">100ms</div>
                <p className="text-gray-600">Price Update Interval</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-black mb-2">35ms</div>
                <p className="text-gray-600">Avg Order Latency</p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 p-12 bg-black rounded-3xl text-center text-white">
          <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Instrument Serif, serif' }}>
            Ready to Start Trading?
          </h3>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of traders using TradeX for professional cryptocurrency trading with advanced tools and real-time data.
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-full px-12 py-7 text-base font-semibold bg-white text-black hover:bg-gray-100"
          >
            <Link to="/signup">Create Free Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
