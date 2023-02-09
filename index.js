const Taapi = require('taapi')
const axios = require('axios')
const taapi = new Taapi.default('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbHVlIjoiNjAzMzU3ODZmZTBhZjZjNmJlOWQ0N2IxIiwiaWF0IjoxNjc1OTY3NTcyLCJleHAiOjMzMTgwNDMxNTcyfQ.IxngA8XZZbYdlWJWEI05jUv0cFwW6FDbjxn1uxdORLc')

async function fetchUsdtTradingPairsWithBBands() {
    try {
      const response = await axios.get('https://api.binance.com/api/v3/ticker/price');
      const symbolsAndPrices = response.data.filter(pair => pair.symbol.endsWith("USDT"));
      let finalArray = [];
      let index = 0;
      const interval = setInterval(async () => {
        if (index >= symbolsAndPrices.length) {
          clearInterval(interval);
          console.log(finalArray);
          return;
        }
        const { symbol, price } = symbolsAndPrices[index];
        const bbands = await getBBandsForSymbol(symbol);
        bbands?finalArray.push({ symbol, price, bbands }):null;
        index += 1;
        console.log(symbolsAndPrices.length-index, " ", { symbol, price, bbands })
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  }
  
  async function getBBandsForSymbol(symbol) {
    try {
      const response = await taapi.getIndicator("bbands2", `${symbol}`, "5m");
      return response.valueMiddleBand;
    } catch (error) {
    //   console.error(error);
    return false;

    }
  }
  
  fetchUsdtTradingPairsWithBBands();
  