import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoImage from "@/assets/logo.png";
import cryptoImage from "@/assets/crypto.png";
import { Github } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      <nav className="px-6 lg:px-12 py-6 bg-black rounded-b-3xl">
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

      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 lg:py-40 bg-[#f5f8ff]">
        <div className="max-w-6xl mx-auto text-center">
          <h1
            className="text-7xl md:text-8xl lg:text-9xl font-bold text-black mb-8 tracking-tight leading-[0.9]"
            style={{ fontFamily: 'Instrument Serif, serif' }}
          >
            TradeX
          </h1>

          <p className="text-2xl md:text-3xl lg:text-4xl text-black max-w-4xl mx-auto mb-12 leading-tight font-medium">
            Trade strong and profit instantly with the most powerful platform on Crypto
          </p>

          <Button
            asChild
            size="lg"
            className="text-base font-semibold px-12 py-7 h-auto rounded-full bg-black text-white hover:bg-gray-800 transition-all duration-300 hover:scale-105 border-2 border-black"
          >
            <Link to="/trade">Start Trading</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image Side */}
            <div className="flex items-center justify-center">
              <img
                src={cryptoImage}
                alt="Crypto Trading"
                className="w-full max-w-md h-auto object-contain rounded-3xl"
              />
            </div>

            {/* Text Side */}
            <div className="space-y-6">
              <p className="text=base font-semibold text-xs font-bold tracking-widest text-gray-400 uppercase">
                Keys to the New World
              </p>

              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Your TradeX platform is your all-access pass to Crypto. It's a secure way to trade coins, stake assets, and explore a whole new world of digital trading. The power is in your hands.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 mx-6 my-12 bg-gray-50 rounded-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold text-black mb-3">24/7</div>
              <p className="text-lg text-gray-600 font-medium">Real-time Market Data</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-black mb-3">100+</div>
              <p className="text-lg text-gray-600 font-medium">Trading Pairs</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-black mb-3">$10K</div>
              <p className="text-lg text-gray-600 font-medium">Demo Balance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative mt-auto py-24 mx-6 mb-6 rounded-3xl"
        style={{
          background: 'linear-gradient(180deg, #84a9ff 0%, #f5f8ff 100%)'
        }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2
            className="text-7xl md:text-8xl lg:text-9xl font-bold text-black mb-6"
            style={{ fontFamily: 'Instrument Serif, serif' }}
          >
            TradeX
          </h2>

          <p className="text-sm text-black mb-12 font-medium italic">
            "The future of trading is here"
          </p>

          {/* Social Links */}
          <div className="flex justify-center gap-6 mb-12">
            <a
              href="https://x.com/shashankpoola"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:opacity-70 transition-opacity"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="https://github.com/shashank-poola/exness-v3"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:opacity-70 transition-opacity"
            >
              <Github className="w-6 h-6" />
            </a>
          </div>

          <p className="text-xs text-black font-medium">
            COPYRIGHT ©2025 TRADEX.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;