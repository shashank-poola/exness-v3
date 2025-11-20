import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import tradexLogo from "@/assets/tradex-logo.png";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Grid Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      
      {/* Navigation */}
      <nav className="relative z-50 px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <img src={tradexLogo} alt="TradeX" className="h-8 transition-transform group-hover:scale-105" />
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link 
                to="/" 
                className="text-sm font-extrabold text-foreground hover:opacity-70 transition-opacity"
              >
                HOME
              </Link>
              <Link 
                to="/docs" 
                className="text-sm font-extrabold text-foreground hover:opacity-70 transition-opacity"
              >
                DOCS
              </Link>
              <Link 
                to="/trade" 
                className="text-sm font-extrabold text-foreground hover:opacity-70 transition-opacity"
              >
                MARKETPLACE
              </Link>
            </div>

            <Button 
              asChild 
              className="rounded-full px-8 h-11 font-extrabold text-sm"
            >
              <Link to="/auth">LOGIN</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 lg:py-40">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-foreground text-foreground text-xs font-extrabold mb-8">
            <span className="w-2 h-2 bg-foreground rounded-full animate-pulse"></span>
            TRADE WITH DEMO BALANCE
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-normal text-foreground mb-6 tracking-tight leading-[1.1]">
            The Future of Online Trading
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed font-sans font-bold">
            Where performance meets reliability. Experience professional crypto trading with advanced tools and real-time market data.
          </p>
          
          <Button 
            asChild 
            size="lg" 
            className="text-base font-extrabold px-12 py-7 h-auto rounded-full transition-all duration-300 hover:scale-105"
          >
            <Link to="/trade">START TRADING</Link>
          </Button>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-6 shadow-lg border-2 border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl font-extrabold text-foreground mb-2">Demo Mode</div>
              <p className="text-muted-foreground font-bold">Practice trading without real money risk</p>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-lg border-2 border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl font-extrabold text-foreground mb-2">BTC & SOL</div>
              <p className="text-muted-foreground font-bold">Trade popular cryptocurrencies</p>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-lg border-2 border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl font-extrabold text-foreground mb-2">Real Charts</div>
              <p className="text-muted-foreground font-bold">TradingView powered analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-auto border-t-2 border-border bg-foreground text-background py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm font-bold">
              © 2025 TradeX. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="mailto:contact@tradex.com" className="text-sm font-bold hover:opacity-70 transition-opacity">
                contact@tradex.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;