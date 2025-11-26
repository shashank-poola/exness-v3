import 'dotenv/config';
import { publisher } from '@exness-v3/redis/pubsub';
import { PriceUpdatePusher } from '@exness-v3/redis/streams';

let assets: Record<string, {}> = {};
let redisConnected = false;

// connecting to redis channel
(async () => {
  try {
    console.log('Connecting to Redis...');
    await publisher.connect();
    await PriceUpdatePusher.connect();
    console.log('✅ Connected to Redis');
    redisConnected = true;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    console.error('Make sure Redis is running on localhost:6379');
    process.exit(1);
  }
})();

const ws = new WebSocket('wss://ws.backpack.exchange/');

const message = {
  method: 'SUBSCRIBE',
  params: ['bookTicker.BTC_USDC', 'bookTicker.ETH_USDC', 'bookTicker.SOL_USDC'],
  id: 1,
};

ws.onopen = (event) => {
  console.log('Connected to backpack data');
  ws.send(JSON.stringify(message));
};

ws.onmessage = async (event) => {
  const { data } = event;
  const parseData = JSON.parse(data).data as Trade;
  const [decimal, integer] = getIntAndDecimal(parseData.a);

  if (integer === undefined || decimal === undefined) {
    return;
  }

  const pricePlusOnePercent = Math.round(integer * 1.01);
  assets[parseData.s] = {
    buyPrice: pricePlusOnePercent,
    sellPrice: integer,
    decimal: decimal,
  };
};

ws.onclose = () => {
  console.log('WebSocket Closed - Attempting reconnect in 5s...');
  setTimeout(() => {
    console.log('Reconnecting...');
    process.exit(1); // Let process manager restart
  }, 5000);
};

ws.onerror = (error) => {
  console.error('WebSocket Error:', error);
};

setInterval(() => {
  if (!redisConnected || Object.keys(assets).length === 0) {
    return;
  }
  const data = {
    data: JSON.stringify(assets),
    type: 'PRICE_UPDATE',
  };
  publisher.publish('ws:price:update', JSON.stringify(data));
  PriceUpdatePusher.xAdd('stream:engine', '*', data);
}, 100);

interface Trade {
  A: string;
  B: string;
  E: number;
  T: number;
  a: string;
  b: string;
  e: string;
  s: string;
  u: number;
}

function getIntAndDecimal(price: string): [number, number] | [undefined, undefined] {
  const arr = price.split('.');

  if (!arr[1]) {
    return [undefined, undefined];
  }

  const decimal = arr[1].length;
  const integer = Number(arr.join(''));

  return [decimal, integer];
}