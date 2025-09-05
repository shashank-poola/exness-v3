import WebSocket from "ws";
import { createClient } from "redis";

const Publisher = createClient({
    url: "redis://localhost:6379"
});

const URL = "wss://ws.backpack.exchange";
const payload = {
    method: "SUBSCRIBE",
    params: ["bookTicker.BTC_USDC_PERP",
             "bookTicker.ETH_USDC_PERP",
             "bookTicker.SOL_USDC_PERP"
    ],
};

const decimal: any = {
    SOL_USDC_PERP: 4,
    BTC_USDC_PERP: 6
};

function transformData(latestPrices: any, decimal: any) {
    const res = [];
    for (const [symbol, priceStr] of Object.entries(latestPrices)) {
        const asset = symbol.split("_")[0];
        const dec = decimal[symbol] || 6;
        const price = Math.floor(
            parseFloat(priceStr as string) * Math.pow(10, dec),

        );
        res.push({
            asset: asset,
            price: price,
            decimal: dec,
        });

    }
    return res;
}



async function connectRedis() {
    await Publisher.connect()

    console.log("Redis connected")

    const ws = new WebSocket(URL);
    const latestPrices: any = {}
    let hasChanged = false;

    ws.onopen = () => {
        console.log("connected to websocket")
        ws.send(JSON.stringify(payload))
    };

    ws.onmessage = (event) => {
        try {
            const response = JSON.parse(event.data as string);
            const marketData = response?.data;
            if (marketData) {
                const symbol = marketData.s;
                const price = marketData.a;
                if (latestPrices[symbol] !== price) {
                    latestPrices[symbol] = price;
                    hasChanged = true;
                    const transforedData = transformData(latestPrices, decimal);
                    console.log(transforedData);
                    for (const trade of transformedData) {
                        await Publisher.xAdd("trade-stream", "*", {
                            asset: trade.asset ?? "",
                            price: trade.price.toString(),
                            decimal: trade.decimal.toString(),
                            timestamp: Date.now().toString(),
                        });
                    }
                }
            }
        } catch (e) {
            console.error("Failed to parse message", e)
        }
    };

    ws.onclose = () => {
        console.log("Disconnected");
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
}

    connectRedis();