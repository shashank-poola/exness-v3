import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const DocsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold font-heading text-foreground">
              TradeX
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-base font-medium text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/docs" className="text-base font-medium text-foreground hover:text-primary transition-colors">
                Docs
              </Link>
              <Link to="/trade" className="text-base font-medium text-foreground hover:text-primary transition-colors">
                Marketplace
              </Link>
            </div>

            <Button asChild>
              <Link to="/auth">Login</Link>
            </Button>
          </div>
        </div>
      </nav>
      
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-16">
          <h1 className="text-5xl font-bold font-heading mb-6">TradeX Documentation</h1>
          <p className="text-xl text-muted-foreground">
            Comprehensive guide to professional crypto trading with BTC and SOL
          </p>
        </div>

        <div className="grid gap-8">
          <Card className="p-8">
            <h2 className="text-3xl font-bold font-heading mb-4">Getting Started</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Learn the basics of trading cryptocurrencies on TradeX platform.
            </p>
            <ul className="space-y-3 text-base">
              <li>• Account setup and verification</li>
              <li>• Understanding the trading interface</li>
              <li>• Making your first trade</li>
              <li>• Security best practices</li>
            </ul>
          </Card>

          <Card className="p-8">
            <h2 className="text-3xl font-bold font-heading mb-4">Trading Features</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Master advanced trading features and tools available on TradeX.
            </p>
            <ul className="space-y-3 text-base">
              <li>• Leverage trading (1x to 100x)</li>
              <li>• Stop loss and take profit orders</li>
              <li>• Real-time TradingView charts</li>
              <li>• Live bid/ask pricing</li>
            </ul>
          </Card>

          <Card className="p-8">
            <h2 className="text-3xl font-bold font-heading mb-4">Supported Assets</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Currently supported cryptocurrencies and trading pairs.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xl font-bold font-heading">Bitcoin</div>
                <div className="text-muted-foreground">BTC/USDT</div>
              </div>
              <div>
                <div className="text-xl font-bold font-heading">Solana</div>
                <div className="text-muted-foreground">SOL/USDT</div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-3xl font-bold font-heading mb-4">Risk Management</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Essential information about trading risks and safety measures.
            </p>
            <ul className="space-y-3 text-base">
              <li>• Understanding leverage risks</li>
              <li>• Position sizing strategies</li>
              <li>• Market volatility considerations</li>
              <li>• Emergency procedures</li>
            </ul>
          </Card>
        </div>

        <div className="mt-16 p-8 bg-card border border-border rounded-lg">
          <h3 className="text-2xl font-bold font-heading mb-3">Need Help?</h3>
          <p className="text-muted-foreground text-lg">
            Contact our 24/7 support team for assistance with your trading questions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
