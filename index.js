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
          const finalResults = (finalArray.sort((a, b) => parseFloat(a.diff) - parseFloat(b.diff))).slice(0,5);
          console.log("Updated Top Results ", finalResults);
          return;
        }
        const { symbol, price } = symbolsAndPrices[index];
        const bbands = await getBBandsForSymbol(symbol);
        if (bbands && (symbol!="LINKUPUSDT" || symbol!="ETHUPUSDT" || symbol!="ADAUPUSDT" || symbol!="BNBUPUSDT" || symbol!="BTCUPUSDT")) {
            const difference = price - bbands;
            const diff = ((difference / bbands) * 100).toFixed(3);  //Percentage Difference
            finalArray.push({ symbol, diff })
            // console.log(symbolsAndPrices.length-index, " ", { symbol, price, bbands, percentageDifference })
            console.log(symbolsAndPrices.length-index, " sec")
          }
        
        index += 1;
        
      }, 550);
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
  