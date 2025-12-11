import {
    handleOpenTrade,
    handleCloseTrade,
    handlePriceUpdateEntry,
    handleFetchOpenOrders,
    handleFetchCandlesticks,
  } from './order.handler';
  import { handleGetUserBalance, handleUserCreation } from './user.handler';
  
  export async function processMessage(message: any) {
    const requestId = message.message.requestId;
    const requestType = message.message.type;
    const payload = JSON.parse(message.message.data);
    try {
      switch (requestType) {
        case 'USER_CREATED':
          await handleUserCreation(payload, requestId);
          break;
        case 'CREATE_ORDER':
          await handleOpenTrade(payload, requestId);
          break;
        case 'CLOSE_ORDER':
          await handleCloseTrade(payload, requestId);
          break;
        case 'PRICE_UPDATE':
          await handlePriceUpdateEntry(payload);
          break;
        case 'GET_USER_BALANCE':
          await handleGetUserBalance(payload, requestId);
          break;
        case 'FETCH_OPEN_ORDERS':
          await handleFetchOpenOrders(payload, requestId);
          break;
        case 'FETCH_CANDLESTICKS':
          await handleFetchCandlesticks(payload, requestId);
          break;
        default:
          console.log(`[HANDLER] Unknown event type: ${requestType}`);
      }
    } catch (error) {
      console.error(`[HANDLER] Error processing ${requestType}:`, error);
      throw error;
    }
  }