import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import tradexLogoImage from "@/assets/tradex-logo.png";
import { ArrowUpRight } from "lucide-react";

const DocsPage = () => {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Navigation */}
      <nav className="px-6 lg:px-12 py-4 bg-white bg-opacity-95 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            {/* TradeX logo on left */}
            <div className="flex items-center">
              <img src={tradexLogoImage} alt="TradeX" className="h-10" />
            </div>

            {/* Navigation links in center - individual borders */}
            <div className="landing-heading hidden md:flex items-center gap-2">
              <Link
                to="/"
                className="text-black text-sm font-bold hover:bg-black hover:text-white px-3 py-1 rounded-full transition-colors border border-black"
              >
                Home
              </Link>
              <Link
                to="/docs"
                className="text-black text-sm font-bold hover:bg-black hover:text-white px-3 py-1 rounded-full transition-colors border border-black"
              >
                Documentation
              </Link>
              <Link
                to="/trade"
                className="text-black text-sm font-bold hover:bg-black hover:text-white px-3 py-1 rounded-full transition-colors border border-black"
              >
                Trade
              </Link>
            </div>

            {/* Sign up button on right - black with arrow */}
            <Button
              asChild
              className="px-4 py-2 bg-black text-white hover:bg-gray-800 text-sm font-medium rounded-full flex items-center gap-2 border border-black"
            >
              <Link to="/signin">
                Sign up
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>
      
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-16 text-center">
          <h1 className="text-6xl font-bold mb-6" style={{ fontFamily: 'Halo Grotesk, sans-serif' }}>
            TradeX Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Production-grade, event-driven microservices architecture for high-frequency cryptocurrency trading with real-time market data.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Architecture Overview */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl" style={{ fontFamily: 'Inter, sans-serif' }}>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Halo Grotesk, sans-serif' }} style={{ fontFamily: 'Halo Grotesk, sans-serif' }}>Architecture Overview</h2>
            <p className="text-gray-700 mb-6 text-lg">
              TradeX is built on a microservices architecture with event-driven communication using Redis Streams and Pub/Sub.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Halo Grotesk, sans-serif' }} style={{ fontFamily: 'Halo Grotesk, sans-serif' }}>Service Components</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Pooler Service (Bun):</strong> WebSocket client for real-time price data from Backpack Exchange, publishes to Redis streams</li>
                  <li>• <strong>Engine Service (Bun):</strong> In-memory order execution with O(1) lookups for sub-millisecond trades, snapshots to MongoDB</li>
                  <li>• <strong>API Service (Node.js):</strong> REST endpoints with JWT authentication using Prisma ORM</li>
                  <li>• <strong>WebSocket Server:</strong> Real-time price broadcasting to connected clients via Redis Pub/Sub</li>
                  <li>• <strong>Frontend (React):</strong> TypeScript-based UI with TailwindCSS, React Query, and Lightweight Charts</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Key Features */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl" style={{ fontFamily: 'Inter, sans-serif' }}>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Halo Grotesk, sans-serif' }} style={{ fontFamily: 'Halo Grotesk, sans-serif' }}>Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Halo Grotesk, sans-serif' }} style={{ fontFamily: 'Halo Grotesk, sans-serif' }}>Real-Time Trading</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Live price updates every 100ms via WebSocket</li>
                  <li>• Interactive candlestick charts with 7 timeframes</li>
                  <li>• Support for BTC, ETH, SOL with 1x-100x leverage</li>
                  <li>• Stop loss, take profit, and slippage protection</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Halo Grotesk, sans-serif' }} style={{ fontFamily: 'Halo Grotesk, sans-serif' }}>Technical Features</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Auto-reconnection on network/laptop sleep</li>
                  <li>• Dark/Light theme with persistent state</li>
                  <li>• JWT authentication with bcrypt security</li>
                  <li>• Responsive design with real-time balance tracking</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Technology Stack */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl" style={{ fontFamily: 'Inter, sans-serif' }}>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Halo Grotesk, sans-serif' }}>Technology Stack</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Halo Grotesk, sans-serif' }}>Frontend</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>React + TypeScript:</strong> Modern UI with type safety</li>
                  <li>• <strong>TailwindCSS:</strong> Utility-first styling with dark mode</li>
                  <li>• <strong>React Query:</strong> State management and caching</li>
                  <li>• <strong>Lightweight Charts:</strong> Professional candlestick visualization</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Halo Grotesk, sans-serif' }}>Backend & Infrastructure</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Node.js + Express:</strong> REST API service</li>
                  <li>• <strong>Bun Runtime:</strong> High-performance engine and pooler services</li>
                  <li>• <strong>PostgreSQL + Prisma:</strong> User data and trade history</li>
                  <li>• <strong>Redis:</strong> Pub/Sub messaging and streams</li>
                  <li>• <strong>MongoDB:</strong> Engine state snapshots</li>
                  <li>• <strong>Turborepo:</strong> Monorepo orchestration</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Trading Features */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl" style={{ fontFamily: 'Inter, sans-serif' }}>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Halo Grotesk, sans-serif' }}>Trading Features</h2>
            <div className="space-y-4">
              <ul className="space-y-3 text-gray-700 text-lg">
                <li>• <strong>Leverage Trading:</strong> 1x to 100x position multiplier with margin calculation</li>
                <li>• <strong>Real-time Charts:</strong> Lightweight Charts with 7 timeframes (1m, 5m, 30m, 1h, 6h, 1d, 3d)</li>
                <li>• <strong>Demo Balance:</strong> Start with $10,000 virtual USD for testing</li>
                <li>• <strong>Multiple Assets:</strong> BTC_USDC, ETH_USDC, SOL_USDC from Backpack Exchange</li>
                <li>• <strong>Price Updates:</strong> WebSocket data every 100ms with automatic reconnection</li>
                <li>• <strong>Advanced Orders:</strong> Stop loss, take profit, and slippage protection</li>
                <li>• <strong>Order Management:</strong> Open orders, closed orders, and real-time P&L tracking</li>
              </ul>
            </div>
          </Card>

          {/* API Endpoints */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl" style={{ fontFamily: 'Inter, sans-serif' }}>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Halo Grotesk, sans-serif' }}>API Endpoints</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Halo Grotesk, sans-serif' }}>Authentication</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div>POST /auth/signup - Create account with $10,000 demo balance</div>
                  <div>POST /auth/signin - Get JWT token for authenticated requests</div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Halo Grotesk, sans-serif' }}>Trading</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div>POST /trade/create-order - Open LONG/SHORT position with leverage</div>
                  <div>POST /trade/close-order - Close position and calculate P&L</div>
                  <div>GET /trade/get-open-orders - Get all active positions</div>
                  <div>GET /trade/get-close-orders - Get completed trade history</div>
                  <div>GET /balance/me - Check current account balance</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Performance */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl" style={{ fontFamily: 'Inter, sans-serif' }}>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Halo Grotesk, sans-serif' }}>Performance Metrics</h2>
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
        <div className="mt-16 p-12 bg-black rounded-3xl text-center text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
          <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Halo Grotesk, sans-serif' }}>
            Ready to Start Trading?
          </h3>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join TradeX for professional cryptocurrency trading with real-time data from Backpack Exchange and advanced risk management tools.
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-full px-12 py-7 text-base font-semibold bg-white text-black hover:bg-gray-100"
          >
            <Link to="/signin">Create Free Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
