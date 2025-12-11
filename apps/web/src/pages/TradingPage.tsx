import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import tradexLogo from "@/assets/tradex-logo.png";
import whiteLogo from "@/assets/whitelogo.png";
import { TradingChart } from "@/components/TradingChart";
import { useWebSocket } from "@/hooks/useWebSocket";
import { getSymbolPrice, PriceData } from "@/lib/price-store";
import { processPriceTick } from "@/lib/candlestick-store";
import { useBalance, useCreateOrder, useCloseOrder, useOpenOrders, useAllOrders } from "@/hooks/useTrade";
import { isAuthenticated, getUserEmail, useLogout } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { User, LogOut, Moon, Sun } from "lucide-react";

const TradingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("positions");
  const [ordersTab, setOrdersTab] = useState("open");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1m");
  const [leverage, setLeverage] = useState(1);
  const [volume, setVolume] = useState("1.00");
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [slippage, setSlippage] = useState("1");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signin');
    }
  }, [navigate]);

  // Backend hooks
  const { data: balance } = useBalance();
  const { data: openOrdersData } = useOpenOrders();
  const allOrdersData = useAllOrders();
  const createOrder = useCreateOrder();
  const closeOrder = useCloseOrder();
  const logout = useLogout();

  // Live prices state
  const [prices, setPrices] = useState<Record<string, PriceData>>({});

  // Connect to WebSocket for real-time prices
  useWebSocket((msg) => {
    // Update price display
    setPrices((prev) => {
      const current = prev[msg.symbol] || { ask: 0, bid: 0, time: Date.now() };
      const newPrices = {
        ...prev,
        [msg.symbol]: {
          ask: msg.type === 'ASK' ? msg.price : current.ask,
          bid: msg.type === 'BID' ? msg.price : current.bid,
          time: msg.time,
        },
      };

      // Only update candlesticks when we have both ASK and BID
      // Use mid-price for more accurate candlestick representation
      const symbolPrices = newPrices[msg.symbol];
      if (symbolPrices.ask > 0 && symbolPrices.bid > 0) {
        const midPrice = (symbolPrices.ask + symbolPrices.bid) / 2;
        processPriceTick({
          ...msg,
          price: midPrice,
        });
      }

      return newPrices;
    });
  });

  const cryptoPrices = [
    {
      symbol: "BTC",
      binanceSymbol: "BTCUSDT",
      icon: "₿",
      color: "text-orange-500"
    },
    {
      symbol: "ETH",
      binanceSymbol: "ETHUSDT",
      icon: "♦",
      color: "text-gray-700"
    },
    {
      symbol: "SOL",
      binanceSymbol: "SOLUSDT",
      icon: "◎",
      color: "text-purple-500"
    },
  ];

  // Helper function to format price
  const formatPrice = (price: number | undefined) => {
    if (!price) return "$0.00";
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper function to truncate email
  const truncateEmail = (email: string | null) => {
    if (!email) return "user@example.com";
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 3) return email;
    return `${localPart.substring(0, 3)}...@${domain}`;
  };

  // Get current price for selected crypto
  const selectedPrice = prices[`${selectedCrypto}USDT`] || { ask: 0, bid: 0, time: 0 };

  // Handle buy/sell
  const handleTrade = async (side: 'LONG' | 'SHORT') => {
    const asset = `${selectedCrypto}_USDC`;
    const currentPrice = side === 'LONG' ? selectedPrice.ask : selectedPrice.bid;

    if (!currentPrice || currentPrice === 0) {
      alert('Price not available. Please wait for price data.');
      return;
    }

    try {
      await createOrder.mutateAsync({
        asset,
        side,
        quantity: parseFloat(volume),
        leverage,
        tradeOpeningPrice: currentPrice,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
        slippage: parseFloat(slippage),
      });

      alert(`${side} order placed successfully!`);
      // Reset form
      setTakeProfit('');
      setStopLoss('');
    } catch (error: any) {
      alert(`Failed to place order: ${error.response?.data?.message || error.message}`);
    }
  };

  const openOrders = openOrdersData?.orders || [];
  const allOrders = allOrdersData?.orders || [];

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex flex-col overflow-hidden transition-colors">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 px-6 py-3 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={theme === 'dark' ? whiteLogo : tradexLogo} alt="TradeX" className="h-8" />
          </Link>
          
          <nav className="flex items-center gap-8">
            <Link to="/" className="text-sm font-extrabold hover:opacity-70 dark:text-white">HOME</Link>
            <Link to="/docs" className="text-sm font-extrabold hover:opacity-70 dark:text-white">DOCS</Link>
            <Link to="/trade" className="text-sm font-extrabold hover:opacity-70 dark:text-white">TRADE</Link>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm font-extrabold dark:text-white">
              BALANCE: ${balance?.balance ? Number(balance.balance).toFixed(2) : '0.00'}
            </span>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors dark:text-white"
              >
                <User className="w-5 h-5" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">EMAIL</p>
                    <p className="text-sm font-extrabold truncate dark:text-white">{truncateEmail(getUserEmail())}</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-extrabold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
                  </button>
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-extrabold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    LOGOUT
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Ticker Bar */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center gap-8 bg-gray-50 dark:bg-gray-800">
        {cryptoPrices.map((crypto) => {
          const price = prices[crypto.binanceSymbol];
          return (
            <button
              key={crypto.symbol}
              onClick={() => setSelectedCrypto(crypto.symbol)}
              className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${
                selectedCrypto === crypto.symbol ? 'opacity-100 scale-105' : 'opacity-70'
              }`}
            >
              <span className={`font-bold text-lg ${crypto.color}`}>{crypto.icon}</span>
              <span className="text-sm font-medium font-extrabold dark:text-white">{crypto.symbol}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-600 rounded font-bold text-green-700 dark:text-green-400">
                  BID: {formatPrice(price?.bid)}
                </span>
                <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-600 rounded font-bold text-red-700 dark:text-red-400">
                  ASK: {formatPrice(price?.ask)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chart Area */}
        <div className="flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Timeframe:</span>
              {["1m", "5m", "30m", "1h", "6h", "1d", "3d"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    selectedTimeframe === tf
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <span className="text-sm font-extrabold dark:text-white">TRADING {selectedCrypto}/USD</span>
          </div>

          {/* TradingView Chart */}
          <Card className="flex-1 p-0 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 overflow-hidden">
            <TradingChart symbol={`${selectedCrypto}USDT`} interval={selectedTimeframe} />
          </Card>

          {/* Orders Section - Fixed Height Container */}
          <div className="mt-4 h-40 flex flex-col">
            <Tabs value={ordersTab} onValueChange={setOrdersTab} className="flex flex-col h-full">
              <TabsList className="bg-transparent border-b border-gray-200 dark:border-gray-700 rounded-none w-full justify-start h-auto p-0 flex-shrink-0">
                <TabsTrigger
                  value="open"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent px-4 py-2 dark:text-gray-300"
                >
                  Open Orders ({openOrders.length})
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent px-4 py-2 dark:text-gray-300"
                >
                  All Orders ({allOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="open" className="flex-1 overflow-y-auto mt-0 py-4">
                {openOrders.length === 0 ? (
                  <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">No open orders found</p>
                ) : (
                  <div className="space-y-2">
                    {openOrders.map((order: any) => (
                      <div key={order.id} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1 grid grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Asset</span>
                              <p className="font-extrabold dark:text-white">{order.asset.replace('_', '/')}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Side</span>
                              <p className={`font-extrabold ${order.side === 'LONG' ? 'text-green-600' : 'text-red-600'}`}>
                                {order.side}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Size</span>
                              <p className="font-extrabold dark:text-white">{order.quantity}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Entry Price</span>
                              <p className="font-extrabold dark:text-white">${order.openPrice?.toFixed(2) || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Leverage</span>
                              <p className="font-extrabold dark:text-white">{order.leverage}x</p>
                            </div>
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => closeOrder.mutate({ orderId: order.id })}
                              disabled={closeOrder.isPending}
                              className="bg-red-500 text-white px-4 py-2 rounded text-xs font-bold hover:bg-red-600 disabled:opacity-50"
                            >
                              {closeOrder.isPending ? 'CLOSING...' : 'CLOSE'}
                            </button>
                          </div>
                        </div>

                        {/* Additional Details Row for Open Orders */}
                        <div className="grid grid-cols-3 gap-4 text-sm pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Slippage</span>
                            <p className="font-extrabold dark:text-white">
                              {order.slippage ? `${(order.slippage * 100).toFixed(2)}%` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Stop Loss</span>
                            <p className="font-extrabold dark:text-white">
                              {order.stopLoss ? `$${order.stopLoss.toFixed(2)}` : 'Not set'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Take Profit</span>
                            <p className="font-extrabold dark:text-white">
                              {order.takeProfit ? `$${order.takeProfit.toFixed(2)}` : 'Not set'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all" className="flex-1 overflow-y-auto mt-0 py-4">
                {allOrders.length === 0 ? (
                  <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">No orders found</p>
                ) : (
                  <div className="space-y-2">
                    {allOrders.map((order: any) => {
                      // Determine if this is a closed order (from database) or open order (from engine)
                      const isClosedOrder = order.closePrice !== undefined || order.liquidated !== undefined || order.reason !== undefined;
                      const status = isClosedOrder ? 'CLOSED' : (order.status || 'OPEN');

                      return (
                        <div key={order.id} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded p-4">
                          <div className="grid grid-cols-6 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Asset</span>
                              <p className="font-extrabold dark:text-white">{order.asset.replace('_', '/')}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Side</span>
                              <p className={`font-extrabold ${order.side === 'LONG' ? 'text-green-600' : 'text-red-600'}`}>
                                {order.side}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Size</span>
                              <p className="font-extrabold dark:text-white">{order.quantity}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Entry/Exit</span>
                              <p className="font-extrabold dark:text-white text-xs">
                                ${order.openPrice?.toFixed(2) || 'N/A'}
                                {isClosedOrder && (
                                  <>
                                    <br />
                                    <span className="text-gray-500">→ ${order.closePrice?.toFixed(2) || 'N/A'}</span>
                                  </>
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Leverage</span>
                              <p className="font-extrabold dark:text-white">{order.leverage}x</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Status</span>
                              <p className={`font-extrabold ${
                                status === 'OPEN' ? 'text-green-600' :
                                status === 'CLOSED' ? 'text-gray-600 dark:text-gray-400' :
                                'text-red-600'
                              }`}>
                                {status}
                              </p>
                            </div>
                          </div>

                          {/* Additional Details Row */}
                          <div className="grid grid-cols-4 gap-4 text-sm mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">P&L</span>
                              <p className={`font-extrabold ${order.pnl && order.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {order.pnl ? `${order.pnl >= 0 ? '+' : ''}$${order.pnl.toFixed(2)}` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Slippage</span>
                              <p className="font-extrabold dark:text-white">
                                {order.slippage ? `${(order.slippage * 100).toFixed(2)}%` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Stop Loss</span>
                              <p className="font-extrabold dark:text-white">
                                {order.stopLoss ? `$${order.stopLoss.toFixed(2)}` : 'Not set'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Take Profit</span>
                              <p className="font-extrabold dark:text-white">
                                {order.takeProfit ? `$${order.takeProfit.toFixed(2)}` : 'Not set'}
                              </p>
                            </div>
                          </div>

                          {/* Close Reason for Closed Orders */}
                          {isClosedOrder && order.reason && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-bold">Reason:</span> {order.reason}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="grid grid-cols-2 bg-white dark:bg-gray-900 rounded-none border-b border-gray-200 dark:border-gray-700 h-auto">
              <TabsTrigger
                value="positions"
                className="text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent py-3 dark:text-gray-300"
              >
                POSITIONS
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent py-3 dark:text-gray-300"
              >
                CHAT
              </TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="flex-1 p-4 overflow-y-auto mt-0">
              <div className="space-y-4">
                {/* Bid/Ask Price Info */}
                <div className="flex gap-2">
                  <div className="flex-1 bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-600 rounded p-2 text-center">
                    <div className="text-[10px] font-extrabold text-gray-600 dark:text-gray-400 mb-1">BID</div>
                    <div className="text-sm font-extrabold text-green-600 dark:text-green-400">
                      {formatPrice(selectedPrice.bid)}
                    </div>
                  </div>
                  <div className="flex-1 bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-600 rounded p-2 text-center">
                    <div className="text-[10px] font-extrabold text-gray-600 dark:text-gray-400 mb-1">ASK</div>
                    <div className="text-sm font-extrabold text-red-600 dark:text-red-400">
                      {formatPrice(selectedPrice.ask)}
                    </div>
                  </div>
                </div>

                {/* Trading Input Form */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-extrabold mb-1 block dark:text-white">Volume/Quantity</label>
                    <input
                      type="number"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded text-sm font-bold"
                      step="0.01"
                    />
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-bold">Range: 0.01 - 100.00</p>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold mb-1 block dark:text-white">Leverage: {leverage}x</label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={leverage}
                      onChange={(e) => setLeverage(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-bold">
                      <span>1x</span>
                      <span>5x</span>
                      <span>10x</span>
                      <span>50x</span>
                      <span>100x</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold mb-1 block dark:text-white">Take Profit (Optional)</label>
                    <input
                      type="number"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      placeholder="Not set"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold mb-1 block dark:text-white">Slippage (%)</label>
                    <input
                      type="number"
                      value={slippage}
                      onChange={(e) => setSlippage(e.target.value)}
                      placeholder="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold mb-1 block dark:text-white">Stop Loss (Optional)</label>
                    <input
                      type="number"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      placeholder="Not set"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded text-sm font-bold"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTrade('LONG')}
                      disabled={createOrder.isPending}
                      className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black text-sm font-extrabold rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {createOrder.isPending ? 'BUYING...' : 'BUY'}
                    </button>
                    <button
                      onClick={() => handleTrade('SHORT')}
                      disabled={createOrder.isPending}
                      className="flex-1 py-3 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white text-sm font-extrabold rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {createOrder.isPending ? 'SELLING...' : 'SELL'}
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 p-4 overflow-y-auto mt-0">
              <div className="space-y-3">
                <div className="bg-gray-100 dark:bg-gray-800 rounded p-3">
                  <p className="text-xs text-gray-700 dark:text-gray-300">Welcome to TradeX chat. Ask me anything about your trades!</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded px-3 py-2"
                  />
                  <button className="px-3 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded">
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
