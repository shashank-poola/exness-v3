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
import btcIcon from "../assets/btc.png";
import ethIcon from "../assets/eth.png";
import solIcon from "../assets/sol.png";

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
  const [mobileSheet, setMobileSheet] = useState<'buy' | 'sell' | 'orders' | null>(null);

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
      icon: btcIcon,
      color: "text-orange-500"
    },
    {
      symbol: "ETH",
      binanceSymbol: "ETHUSDT",
      icon: ethIcon,
      color: "text-gray-700"
    },
    {
      symbol: "SOL",
      binanceSymbol: "SOLUSDT",
      icon: solIcon,
      color: "text-purple-500"
    },
  ];

  // Helper function to format price
  const formatPrice = (price: number | undefined) => {
    if (!price) return "$0.00";
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Normalize entry/exit price fields coming from engine/DB.
  // Engine currently sends margin in openPrice and actual fill in tradeOpeningPrice.
  const getEntryPrice = (order: any): number | null => {
    if (!order) return null;
    if (order.tradeOpeningPrice) return Number(order.tradeOpeningPrice);
    if (order.openPrice) return Number(order.openPrice);
    return null;
  };

  // Map asset from engine/DB to WebSocket symbol (e.g. SOL_USDC -> SOLUSDT)
  const mapAssetToSymbol = (asset: string): string => {
    const compact = asset.replace('_', '');
    if (compact.endsWith('USDC')) return compact.replace('USDC', 'USDT');
    return compact;
  };

  // Compute live (unrealized) P&L for an order using current mid price
  const computeUnrealizedPnl = (order: any): number | null => {
    const entryPrice = getEntryPrice(order);
    if (!order || !order.asset || entryPrice === null) return null;
    const symbol = mapAssetToSymbol(order.asset);
    const price = prices[symbol];
    if (!price || !price.ask || !price.bid) return null;

    const midPrice = (price.ask + price.bid) / 2;
    const direction = order.side === 'LONG' ? 1 : -1;
    const quantity = Number(order.quantity) || 0;
    const lev = Number(order.leverage) || 1;

    if (!quantity || !lev) return null;

    return direction * (midPrice - entryPrice) * quantity * lev;
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
      <header className="border-b border-gray-200 dark:border-gray-700 px-3 lg:px-6 py-3 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={theme === 'dark' ? whiteLogo : tradexLogo} alt="TradeX" className="h-6 lg:h-8" />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-sm font-extrabold hover:opacity-70 dark:text-white">HOME</Link>
            <Link to="/docs" className="text-sm font-extrabold hover:opacity-70 dark:text-white">DOCS</Link>
            <Link to="/trade" className="text-sm font-extrabold hover:opacity-70 dark:text-white">TRADE</Link>
          </nav>

          <div className="flex items-center gap-2 lg:gap-4">
            <span className="text-xs lg:text-sm font-extrabold dark:text-white">
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
      <div className="border-b border-gray-200 dark:border-gray-700 px-3 lg:px-6 py-2 lg:py-3 flex items-center gap-4 lg:gap-8 bg-gray-50 dark:bg-gray-800 overflow-x-auto flex-nowrap">
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
              <img
                src={crypto.icon}
                alt={crypto.symbol}
                className="h-5 w-5"
              />
              <span className="text-sm font-extrabold dark:text-white">{crypto.symbol}</span>
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
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pb-14 lg:pb-0">
        {/* Chart Area */}
        <div className="flex-1 flex flex-col p-2 lg:p-6 min-h-0">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="flex items-center gap-1 lg:gap-2 overflow-x-auto flex-nowrap">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">Timeframe:</span>
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
            <span className="text-xs lg:text-sm font-extrabold dark:text-white hidden sm:block">TRADING {selectedCrypto}/USD</span>
          </div>

          {/* TradingView Chart */}
          <Card className="flex-1 p-0 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[250px] lg:min-h-0">
            <TradingChart symbol={`${selectedCrypto}USDT`} interval={selectedTimeframe} />
          </Card>

          {/* Orders Section - desktop only */}
          <div className="mt-2 lg:mt-4 h-36 lg:h-40 hidden lg:flex flex-col flex-shrink-0">
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
                    {openOrders.map((order: any, index: number) => {
                      const unrealizedPnl = computeUnrealizedPnl(order);
                      const pnlColor =
                        unrealizedPnl === null
                          ? 'text-gray-400'
                          : unrealizedPnl >= 0
                            ? 'text-green-600'
                            : 'text-red-600';

                      return (
                        <div key={`open-${order.id ?? 'unknown'}-${index}`} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 grid grid-cols-4 lg:grid-cols-8 gap-2 lg:gap-3 text-sm">
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
                                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Entry</span>
                                <p className="font-extrabold dark:text-white">
                                  {getEntryPrice(order) !== null ? `$${getEntryPrice(order)!.toFixed(2)}` : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Leverage</span>
                                <p className="font-extrabold dark:text-white">{order.leverage}x</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Slippage</span>
                                <p className="font-extrabold dark:text-white">
                                  {order.slippage ? `${(order.slippage * 100).toFixed(2)}%` : 'Default'}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">P&L</span>
                                <p className={`font-extrabold ${pnlColor}`}>
                                  {unrealizedPnl === null
                                    ? 'N/A'
                                    : `${unrealizedPnl >= 0 ? '+' : ''}$${unrealizedPnl.toFixed(2)}`}
                                </p>
                              </div>
                              <div className="flex items-end">
                                <button
                                  onClick={() => closeOrder.mutate({ orderId: order.id })}
                                  disabled={closeOrder.isPending}
                                  className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-600 disabled:opacity-50"
                                >
                                  {closeOrder.isPending ? 'CLOSING...' : 'CLOSE'}
                                </button>
                              </div>
                            </div>
                          </div>

                        {/* Conditional Stop Loss & Take Profit Row - Only show if set */}
                        {(order.stopLoss || order.takeProfit) && (
                          <div className="flex gap-6 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs">
                            {order.stopLoss && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 font-bold">SL:</span>
                                <span className="font-extrabold dark:text-white ml-1">${order.stopLoss.toFixed(2)}</span>
                              </div>
                            )}
                            {order.takeProfit && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 font-bold">TP:</span>
                                <span className="font-extrabold dark:text-white ml-1">${order.takeProfit.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all" className="flex-1 overflow-y-auto mt-0 py-4">
                {allOrders.length === 0 ? (
                  <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">No orders found</p>
                ) : (
                  <div className="space-y-2">
                    {allOrders.map((order: any, index: number) => {
                      // Determine if this is a closed order (from database) or open order (from engine)
                      const isClosedOrder = order.closePrice !== undefined || order.liquidated !== undefined || order.reason !== undefined;
                      const status = isClosedOrder ? 'CLOSED' : (order.status || 'OPEN');

                      const unrealizedPnl = !isClosedOrder ? computeUnrealizedPnl(order) : null;
                      const effectivePnl = isClosedOrder ? order.pnl ?? null : unrealizedPnl;
                      const pnlColor =
                        effectivePnl === null
                          ? 'text-gray-400'
                          : effectivePnl >= 0
                            ? 'text-green-600'
                            : 'text-red-600';

                      return (
                        <div key={`all-${order.id ?? 'unknown'}-${index}`} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded p-3">
                          <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 lg:gap-3 text-sm">
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
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Entry</span>
                              <p className="font-extrabold dark:text-white">
                                {getEntryPrice(order) !== null ? `$${getEntryPrice(order)!.toFixed(2)}` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Exit</span>
                              <p className="font-extrabold dark:text-white">
                                {isClosedOrder && order.closePrice ? `$${order.closePrice.toFixed(2)}` : 'N/A'}
                              </p>
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
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">P&L</span>
                              <p className={`font-extrabold ${pnlColor}`}>
                                {effectivePnl === null
                                  ? 'N/A'
                                  : `${effectivePnl >= 0 ? '+' : ''}$${effectivePnl.toFixed(2)}`}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">Slip</span>
                              <p className="font-extrabold dark:text-white">
                                {order.slippage ? `${(order.slippage * 100).toFixed(2)}%` : 'Default'}
                              </p>
                            </div>
                          </div>

                          {/* Conditional Details Row - Only show if there's data */}
                          {(order.stopLoss || order.takeProfit || (isClosedOrder && order.reason)) && (
                            <div className="flex gap-6 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs">
                              {order.stopLoss && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 font-bold">SL:</span>
                                  <span className="font-extrabold dark:text-white ml-1">${order.stopLoss.toFixed(2)}</span>
                                </div>
                              )}
                              {order.takeProfit && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 font-bold">TP:</span>
                                  <span className="font-extrabold dark:text-white ml-1">${order.takeProfit.toFixed(2)}</span>
                                </div>
                              )}
                              {isClosedOrder && order.reason && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 font-bold">Reason:</span>
                                  <span className="font-extrabold dark:text-white ml-1">{order.reason}</span>
                                </div>
                              )}
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

        {/* Right Sidebar - desktop only */}
        <div className="hidden lg:flex w-80 border-l border-gray-200 dark:border-gray-700 flex-col bg-white dark:bg-gray-900 flex-shrink-0">
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

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 flex border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-40">
        <button
          onClick={() => setMobileSheet('orders')}
          className="flex-1 py-3 text-xs font-extrabold dark:text-white border-r border-gray-200 dark:border-gray-700"
        >
          ORDERS ({openOrders.length})
        </button>
        <button
          onClick={() => setMobileSheet('buy')}
          className="flex-1 py-3 text-sm font-extrabold bg-black dark:bg-white text-white dark:text-black"
        >
          BUY
        </button>
        <button
          onClick={() => setMobileSheet('sell')}
          className="flex-1 py-3 text-sm font-extrabold border-l border-gray-200 dark:border-gray-700 text-black dark:text-white"
        >
          SELL
        </button>
      </div>

      {/* Mobile Bottom Sheet */}
      {mobileSheet && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSheet(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-t-2xl max-h-[85vh] flex flex-col">
            {/* Sheet Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h3 className="text-sm font-extrabold dark:text-white">
                {mobileSheet === 'buy' ? 'BUY' : mobileSheet === 'sell' ? 'SELL' : `ORDERS (${openOrders.length} open)`}
              </h3>
              <button onClick={() => setMobileSheet(null)} className="text-gray-500 dark:text-gray-400 text-lg font-bold px-2">✕</button>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              {/* Orders Sheet */}
              {mobileSheet === 'orders' && (
                <div className="space-y-3">
                  <Tabs value={ordersTab} onValueChange={setOrdersTab}>
                    <TabsList className="bg-transparent border-b border-gray-200 dark:border-gray-700 rounded-none w-full justify-start h-auto p-0 mb-3">
                      <TabsTrigger value="open" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent px-4 py-2 dark:text-gray-300 text-xs font-bold">
                        Open ({openOrders.length})
                      </TabsTrigger>
                      <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent px-4 py-2 dark:text-gray-300 text-xs font-bold">
                        All ({allOrders.length})
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="open">
                      {openOrders.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No open orders</p>
                      ) : (
                        <div className="space-y-3">
                          {openOrders.map((order: any, index: number) => {
                            const unrealizedPnl = computeUnrealizedPnl(order);
                            const pnlColor = unrealizedPnl === null ? 'text-gray-400' : unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600';
                            return (
                              <div key={`mob-open-${order.id ?? index}`} className="border border-gray-200 dark:border-gray-700 rounded p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold dark:text-white text-sm">{order.asset.replace('_', '/')}</span>
                                  <span className={`font-extrabold text-sm ${order.side === 'LONG' ? 'text-green-600' : 'text-red-600'}`}>{order.side}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div><p className="text-gray-500 font-bold">Size</p><p className="font-extrabold dark:text-white">{order.quantity}</p></div>
                                  <div><p className="text-gray-500 font-bold">Entry</p><p className="font-extrabold dark:text-white">{getEntryPrice(order) !== null ? `$${getEntryPrice(order)!.toFixed(2)}` : 'N/A'}</p></div>
                                  <div><p className="text-gray-500 font-bold">Leverage</p><p className="font-extrabold dark:text-white">{order.leverage}x</p></div>
                                  <div><p className="text-gray-500 font-bold">P&L</p><p className={`font-extrabold ${pnlColor}`}>{unrealizedPnl === null ? 'N/A' : `${unrealizedPnl >= 0 ? '+' : ''}$${unrealizedPnl.toFixed(2)}`}</p></div>
                                  <div><p className="text-gray-500 font-bold">Slippage</p><p className="font-extrabold dark:text-white">{order.slippage ? `${(order.slippage * 100).toFixed(2)}%` : 'Default'}</p></div>
                                </div>
                                <button
                                  onClick={() => { closeOrder.mutate({ orderId: order.id }); setMobileSheet(null); }}
                                  disabled={closeOrder.isPending}
                                  className="w-full bg-red-500 text-white py-2 rounded text-xs font-bold hover:bg-red-600 disabled:opacity-50"
                                >
                                  {closeOrder.isPending ? 'CLOSING...' : 'CLOSE POSITION'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="all">
                      {allOrders.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No orders</p>
                      ) : (
                        <div className="space-y-3">
                          {allOrders.map((order: any, index: number) => {
                            const isClosedOrder = order.closePrice !== undefined || order.liquidated !== undefined;
                            const effectivePnl = isClosedOrder ? order.pnl ?? null : computeUnrealizedPnl(order);
                            const pnlColor = effectivePnl === null ? 'text-gray-400' : effectivePnl >= 0 ? 'text-green-600' : 'text-red-600';
                            return (
                              <div key={`mob-all-${order.id ?? index}`} className="border border-gray-200 dark:border-gray-700 rounded p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold dark:text-white text-sm">{order.asset.replace('_', '/')}</span>
                                  <div className="flex gap-2">
                                    <span className={`font-extrabold text-xs ${order.side === 'LONG' ? 'text-green-600' : 'text-red-600'}`}>{order.side}</span>
                                    <span className={`font-extrabold text-xs ${isClosedOrder ? 'text-gray-500' : 'text-green-600'}`}>{isClosedOrder ? 'CLOSED' : 'OPEN'}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div><p className="text-gray-500 font-bold">Size</p><p className="font-extrabold dark:text-white">{order.quantity}</p></div>
                                  <div><p className="text-gray-500 font-bold">Entry</p><p className="font-extrabold dark:text-white">{getEntryPrice(order) !== null ? `$${getEntryPrice(order)!.toFixed(2)}` : 'N/A'}</p></div>
                                  <div><p className="text-gray-500 font-bold">P&L</p><p className={`font-extrabold ${pnlColor}`}>{effectivePnl === null ? 'N/A' : `${effectivePnl >= 0 ? '+' : ''}$${effectivePnl.toFixed(2)}`}</p></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Buy/Sell Order Form Sheet */}
              {(mobileSheet === 'buy' || mobileSheet === 'sell') && (
                <div className="space-y-4">
                  {/* BID/ASK */}
                  <div className="flex gap-2">
                    <div className="flex-1 bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-600 rounded p-2 text-center">
                      <div className="text-[10px] font-extrabold text-gray-600 dark:text-gray-400 mb-1">BID</div>
                      <div className="text-sm font-extrabold text-green-600 dark:text-green-400">{formatPrice(selectedPrice.bid)}</div>
                    </div>
                    <div className="flex-1 bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-600 rounded p-2 text-center">
                      <div className="text-[10px] font-extrabold text-gray-600 dark:text-gray-400 mb-1">ASK</div>
                      <div className="text-sm font-extrabold text-red-600 dark:text-red-400">{formatPrice(selectedPrice.ask)}</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold mb-1 block dark:text-white">Volume/Quantity</label>
                    <input type="number" value={volume} onChange={(e) => setVolume(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded text-sm font-bold" step="0.01" />
                    <p className="text-[10px] text-gray-500 mt-1 font-bold">Range: 0.01 - 100.00</p>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold mb-1 block dark:text-white">Leverage: {leverage}x</label>
                    <input type="range" min="1" max="100" value={leverage} onChange={(e) => setLeverage(Number(e.target.value))} className="w-full" />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-bold">
                      <span>1x</span><span>5x</span><span>10x</span><span>50x</span><span>100x</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold mb-1 block dark:text-white">Slippage (%)</label>
                    <input type="number" value={slippage} onChange={(e) => setSlippage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded text-sm font-bold" />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold mb-1 block dark:text-white">Take Profit (Optional)</label>
                    <input type="number" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} placeholder="Not set"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded text-sm font-bold" />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold mb-1 block dark:text-white">Stop Loss (Optional)</label>
                    <input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} placeholder="Not set"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded text-sm font-bold" />
                  </div>

                  <button
                    onClick={async () => {
                      await handleTrade(mobileSheet === 'buy' ? 'LONG' : 'SHORT');
                      setMobileSheet(null);
                    }}
                    disabled={createOrder.isPending}
                    className={`w-full py-3 text-white text-sm font-extrabold rounded-full disabled:opacity-50 ${
                      mobileSheet === 'buy' ? 'bg-black dark:bg-white dark:text-black' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {createOrder.isPending ? (mobileSheet === 'buy' ? 'BUYING...' : 'SELLING...') : (mobileSheet === 'buy' ? 'CONFIRM BUY' : 'CONFIRM SELL')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingPage;
