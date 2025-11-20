import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import tradexLogo from "@/assets/tradex-logo.png";

const TradingPage = () => {
  const [activeTab, setActiveTab] = useState("positions");
  const [ordersTab, setOrdersTab] = useState("open");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1m");
  const [leverage, setLeverage] = useState(1);
  const [volume, setVolume] = useState("1.00");

  const cryptoPrices = [
    { 
      symbol: "BTC", 
      icon: "₿", 
      bid: "$107,425.00", 
      ask: "$107,435.00", 
      color: "text-orange-500" 
    },
    { 
      symbol: "ETH", 
      icon: "♦", 
      bid: "$3,663.20", 
      ask: "$3,667.80", 
      color: "text-gray-700" 
    },
    { 
      symbol: "SOL", 
      icon: "◎", 
      bid: "$169.95", 
      ask: "$170.01", 
      color: "text-purple-500" 
    },
  ];

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={tradexLogo} alt="TradeX" className="h-8" />
          </Link>
          
          <nav className="flex items-center gap-8">
            <Link to="/" className="text-sm font-extrabold hover:opacity-70">HOME</Link>
            <Link to="/docs" className="text-sm font-extrabold hover:opacity-70">DOCS</Link>
            <Link to="/docs" className="text-sm font-extrabold hover:opacity-70">MARKETPLACE</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-extrabold">BALANCE: $10,000.00</span>
          </div>
        </div>
      </header>

      {/* Ticker Bar */}
      <div className="border-b border-gray-200 px-6 py-3 flex items-center gap-8 bg-gray-50">
        {cryptoPrices.map((crypto) => (
          <button 
            key={crypto.symbol} 
            onClick={() => setSelectedCrypto(crypto.symbol)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className={`font-bold text-sm ${crypto.color}`}>{crypto.icon}</span>
            <span className="text-xs font-medium">{crypto.symbol}</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] px-1.5 py-0.5 bg-green-100 border border-green-300 rounded font-medium">
                BID: {crypto.bid}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-red-100 border border-red-300 rounded font-medium">
                ASK: {crypto.ask}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chart Area */}
        <div className="flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between mb-1 py-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Timeframe:</span>
              {["1m", "5m", "30m", "1h", "6h", "1d", "3d"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    selectedTimeframe === tf
                      ? "bg-black text-white"
                      : "bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <span className="text-sm font-extrabold">TRADING {selectedCrypto}/USD</span>
          </div>

          {/* Chart Placeholder */}
          <Card className="flex-1 p-6 bg-white border border-gray-200">
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Chart visualization would go here
              <br />
              (Multiple colored lines tracking model performance over time)
            </div>
          </Card>

          {/* Orders Section */}
          <div className="mt-4">
            <Tabs value={ordersTab} onValueChange={setOrdersTab}>
              <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-full justify-start h-auto p-0">
                <TabsTrigger 
                  value="open" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-4 py-2"
                >
                  Open Orders (0)
                </TabsTrigger>
                <TabsTrigger 
                  value="all" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-4 py-2"
                >
                  All Orders (0)
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="open" className="py-12 text-center">
                <p className="text-gray-400 text-sm">No open orders found</p>
              </TabsContent>
              
              <TabsContent value="all" className="py-12 text-center">
                <p className="text-gray-400 text-sm">No orders found</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-gray-200 flex flex-col bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="grid grid-cols-2 bg-white rounded-none border-b border-gray-200 h-auto">
              <TabsTrigger 
                value="positions" 
                className="text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-3"
              >
                POSITIONS
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-3"
              >
                CHAT
              </TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="flex-1 p-4 overflow-y-auto mt-0">
              <div className="space-y-4">
                {/* Bid/Ask Price Info */}
                <div className="flex gap-2">
                  <div className="flex-1 bg-green-100 border-2 border-green-300 rounded p-2 text-center">
                    <div className="text-[10px] font-extrabold text-gray-600 mb-1">BID</div>
                    <div className="text-sm font-extrabold text-green-600">
                      {cryptoPrices.find(c => c.symbol === selectedCrypto)?.bid}
                    </div>
                  </div>
                  <div className="flex-1 bg-red-100 border-2 border-red-300 rounded p-2 text-center">
                    <div className="text-[10px] font-extrabold text-gray-600 mb-1">ASK</div>
                    <div className="text-sm font-extrabold text-red-600">
                      {cryptoPrices.find(c => c.symbol === selectedCrypto)?.ask}
                    </div>
                  </div>
                </div>

                {/* Trading Input Form */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-extrabold mb-1 block">Volume/Quantity</label>
                    <input
                      type="number"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-bold"
                      step="0.01"
                    />
                    <p className="text-[10px] text-gray-500 mt-1 font-bold">Range: 0.01 - 100.00</p>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold mb-1 block">Leverage: {leverage}x</label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={leverage}
                      onChange={(e) => setLeverage(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-bold">
                      <span>1x</span>
                      <span>5x</span>
                      <span>10x</span>
                      <span>50x</span>
                      <span>100x</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold mb-1 block">Take Profit (Optional)</label>
                    <input
                      type="text"
                      placeholder="Not set"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold mb-1 block">Stop Loss (Optional)</label>
                    <input
                      type="text"
                      placeholder="Not set"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-bold"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 py-3 bg-black text-white text-sm font-extrabold rounded-full hover:bg-gray-800 transition-colors">
                      BUY
                    </button>
                    <button className="flex-1 py-3 bg-white border-2 border-black text-black text-sm font-extrabold rounded-full hover:bg-gray-50 transition-colors">
                      SELL
                    </button>
                  </div>
                </div>

                {/* Existing Positions */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold">BTC/USD</span>
                        <span className="text-xs text-green-600 font-extrabold">LONG</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-gray-500 font-bold">Size:</span>
                          <span className="ml-1 font-extrabold">0.5 BTC</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-bold">Entry:</span>
                          <span className="ml-1 font-extrabold">$107,000</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-bold">Current:</span>
                          <span className="ml-1 font-extrabold">$107,430</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-bold">P&L:</span>
                          <span className="ml-1 font-extrabold text-green-600">+$215.00</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold">ETH/USD</span>
                        <span className="text-xs text-red-600 font-extrabold">SHORT</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-gray-500 font-bold">Size:</span>
                          <span className="ml-1 font-extrabold">2.0 ETH</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-bold">Entry:</span>
                          <span className="ml-1 font-extrabold">$3,680</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-bold">Current:</span>
                          <span className="ml-1 font-extrabold">$3,665</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-bold">P&L:</span>
                          <span className="ml-1 font-extrabold text-green-600">+$30.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 p-4 overflow-y-auto mt-0">
              <div className="space-y-3">
                <div className="bg-gray-100 rounded p-3">
                  <p className="text-xs text-gray-700">Welcome to TradeX chat. Ask me anything about your trades!</p>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="flex-1 text-xs border border-gray-300 rounded px-3 py-2"
                  />
                  <button className="px-3 py-2 bg-black text-white text-xs font-bold rounded">
                    Send
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TradingPage;
