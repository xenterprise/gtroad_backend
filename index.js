const express = require("express");
const app = express();
const cors = require("cors");
const Taapi = require("taapi");
const axios = require("axios");
const taapiKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbHVlIjoiNjAzMzU3ODZmZTBhZjZjNmJlOWQ0N2IxIiwiaWF0IjoxNjc1OTY3NTcyLCJleHAiOjMzMTgwNDMxNTcyfQ.IxngA8XZZbYdlWJWEI05jUv0cFwW6FDbjxn1uxdORLc";
const taapi = new Taapi.default(taapiKey);
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
        console.log("MMY: symbolsAndPrices1", response.data);
        const symbolsAndPrices = response.data.filter((pair) => {
            return (
                pair.symbol.endsWith("USDT") &&
                pair.symbol !== "USDCUSDT" &&
                pair.symbol !== "USDSUSDT" &&
                pair.symbol !== "BCHSVUSDT" &&
                pair.symbol !== "LINKUPUSDT" &&
                pair.symbol !== "ETHUPUSDT" &&
                pair.symbol !== "BNBUPUSDT" &&
                pair.symbol !== "BTCUPUSDT" &&
                pair.symbol !== "BTTUSDT" &&
                pair.symbol !== "BTCUSDT" &&
                pair.symbol !== "ETHUSDT" &&
                pair.symbol !== "BNBUSDT" &&
                pair.symbol !== "BCHABCUSDT" &&
                pair.symbol !== "USDSBUSDT" &&
                pair.symbol !== "ETHBULLUSDT" &&
                pair.symbol !== "ETHBEARUSDT" &&
                pair.symbol !== "BULLUSDT" &&
                pair.symbol !== "BEARUSDT" &&
                pair.symbol !== "BCCUSDT" &&
                pair.symbol !== "TUSDUSDT" &&
                pair.symbol !== "VENUSDT" &&
                pair.symbol !== "PAXUSDT" &&
                pair.symbol !== "NANOUSDT" &&
                pair.symbol !== "ERDUSDT" &&
                pair.symbol !== "MITHUSDT" &&
                pair.symbol !== "BKRWUSDT" &&
                pair.symbol !== "REPUSDT" &&
                pair.symbol !== "LENDUSDT" &&
                pair.symbol !== "STORMUSDT" &&
                pair.symbol !== "MCOUSDT" &&
                pair.symbol !== "EOSUPUSDT" &&
                pair.symbol !== "HCUSDT" &&
                pair.symbol !== "BEAMUSDT" &&
                pair.symbol !== "CVCUSDT" &&
                pair.symbol !== "FTTUSDT" &&
                pair.symbol !== "TCTUSDT" &&
                pair.symbol !== "EOSBULLUSDT" &&
                pair.symbol !== "EOSBEARUSDT" &&
                pair.symbol !== "XRPBULLUSDT" &&
                pair.symbol !== "XRPBEARUSDT" &&
                pair.symbol !== "GTOUSDT" &&
                pair.symbol !== "BNBBULLUSDT" &&
                pair.symbol !== "BNBBEARUSDT" &&
                pair.symbol !== "XTZUPUSDT" &&
                pair.symbol !== "XTZDOWNUSDT" &&
                pair.symbol !== "BZRXUSDT" &&
                pair.symbol !== "EOSDOWNUSDT" &&
                pair.symbol !== "NPXSUSDT" &&
                pair.symbol !== "STRATUSDT"
            );
        });
        console.log("MMY: symbolsAndPrices", symbolsAndPrices);
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
            console.log();
            // if (
            //     bbands &&
            //     (symbol != "LINKUPUSDT" ||
            //         symbol != "ETHUPUSDT" ||
            //         symbol != "ADAUPUSDT" ||
            //         symbol != "BNBUPUSDT" ||
            //         symbol != "BTCUPUSDT")
            // ) {
            //     const difference = price - bbands;
            //     const diff = ((difference / bbands) * 100).toFixed(3); //Percentage Difference
            //     finalArray.push({ symbol, diff });
            //     console.log(symbolsAndPrices.length - index, " sec");
            // }

            index += 1;
        }, 1500);
    } catch (error) {
        console.error(error);
    }
}

async function getBBandsForSymbol(symbol) {
    try {
        // const response = await taapi.getIndicator("bbands2", `${symbol}`, "5m");
        // return response.valueMiddleBand;

        await axios
            .post("https://api.taapi.io/bulk", {
                secret: taapiKey,
                construct: {
                    exchange: "binance",
                    symbol: `${symbol}`,
                    interval: "5m",
                    indicators: [
                        {
                            indicator: "bbands",
                        },
                        {
                            indicator: "rsi",
                        },
                    ],
                },
            })
            .then((response) => {
                console.log("Response : ", response.data.data);
            })
            .catch((error) => {
                console.error(error);
                clearInterval(intervalId);
            });
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
