const express = require("express");
const app = express();
const cors = require("cors");
const Taapi = require("taapi");
const axios = require("axios");
const taapi = new Taapi.default(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbHVlIjoiNjAzMzU3ODZmZTBhZjZjNmJlOWQ0N2IxIiwiaWF0IjoxNjc1OTY3NTcyLCJleHAiOjMzMTgwNDMxNTcyfQ.IxngA8XZZbYdlWJWEI05jUv0cFwW6FDbjxn1uxdORLc"
);
let operationalCount = 0;
let finalArray = [];
let finalResults = [];
app.use(cors());
app.listen(process.env.PORT || 3000, () => {});
app.get("/data", (req, res) => {
    res.status(200).json(finalResults);
});
let intervalId;

async function fetchUsdtTradingPairsWithBBands() {
    try {
        const response = await axios.get("https://api.binance.com/api/v3/ticker/price");
        const symbolsAndPrices = response.data.filter((pair) => pair.symbol.endsWith("USDT"));
        finalArray = [];
        let index = 0;
        intervalId = setInterval(async () => {
            if (index >= symbolsAndPrices.length) {
                clearInterval(intervalId);
                finalResults = finalArray.sort((a, b) => parseFloat(a.diff) - parseFloat(b.diff)).slice(0, 5);
                console.log("Updated Top Results ", finalResults);
                return;
            }
            const { symbol, price } = symbolsAndPrices[index];
            const bbands = await getBBandsForSymbol(symbol);
            if (
                bbands &&
                (symbol != "LINKUPUSDT" ||
                    symbol != "ETHUPUSDT" ||
                    symbol != "ADAUPUSDT" ||
                    symbol != "BNBUPUSDT" ||
                    symbol != "BTCUPUSDT")
            ) {
                const difference = price - bbands;
                const diff = ((difference / bbands) * 100).toFixed(3); //Percentage Difference
                finalArray.push({ symbol, diff });
                console.log(symbolsAndPrices.length - index, " sec");
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
        return false;
    }
}

fetchUsdtTradingPairsWithBBands();
setInterval(() => {
    try {
        console.log("Iteration Count: ", operationalCount++);
        clearInterval(intervalId);
        fetchUsdtTradingPairsWithBBands();
    } catch (e) {
        console.log("Error: ", e);
    }
}, 250000);
