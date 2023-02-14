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
let finalBbands = [];
let finalRsi = [];
app.use(cors());
app.listen(process.env.PORT || 3000, () => {});
app.get("/data", (req, res) => {
    res.status(200).json(finalResults);
});
let intervalId;

async function fetchUsdtPairsWithIndicatorsData() {
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
                pair.symbol !== "STRATUSDT" &&
                pair.symbol !== "MFTUSDT" &&
                pair.symbol !== "XZCUSDT" &&
                pair.symbol !== "GXSUSDT" &&
                pair.symbol !== "1INCHUPUSDT" &&
                pair.symbol !== "1INCHDOWNUSDT" &&
                pair.symbol !== "EPSUSDT" &&
                pair.symbol !== "RAMPUSDT"&&
                pair.symbol !== "XLMUPUSDT" &&
                pair.symbol !== "XLMDOWNUSDT"&&
                pair.symbol !== "SUSHIUPUSDT" &&
                pair.symbol !== "SUSHIDOWNUSDT" &&
                pair.symbol !== "SUSDUSDT" &&
                pair.symbol !== "AAVEUPUSDT" &&
                pair.symbol !== "AAVEDOWNUSDT" &&
                pair.symbol !== "BCHUPUSDT" &&
                pair.symbol !== "BCHDOWNUSDT" &&
                pair.symbol !== "YFIUPUSDT" &&
                pair.symbol !== "YFIDOWNUSDT" &&
                pair.symbol !== "FILUPUSDT" &&
                pair.symbol !== "FILDOWNUSDT" &&
                pair.symbol !== "SXPUPUSDT" &&
                pair.symbol !== "SXPDOWNUSDT"&&
                pair.symbol !== "DAIUSDT"&&
                pair.symbol !== "USTUSDT"&&
                pair.symbol !== "ANYUSDT"&&
                pair.symbol !== "RGTUSDT"&&
                pair.symbol !== "KEEPUSDT"&&
                pair.symbol !== "UNIDOWNUSDT"&&
                pair.symbol !== "UNIUPUSDT"&&
                pair.symbol !== "LTCDOWNUSDT"&&
                pair.symbol !== "LTCUPUSDT"&&
                pair.symbol !== "NUUSDT"&&
                pair.symbol !== "BTCSTUSDT"&&
                pair.symbol !== "ADADOWNUSDT"&&
                pair.symbol !== "ADAUPUSDT"&&
                pair.symbol !== "ETHDOWNUSDT"&&
                pair.symbol !== "ETHUPUSDT"&&
                pair.symbol !== "BTCDOWNUSDT"&&
                pair.symbol !== "BTCUPUSDT"&&
                pair.symbol !== "LINKDOWNUSDT"&&
                pair.symbol !== "LINKUPUSDT"&&
                pair.symbol !== "XRPDOWNUSDT"&&
                pair.symbol !== "XRPUPUSDT"
            );
        });
        console.log("MMY: symbolsAndPrices", symbolsAndPrices);
        
        let index = 0;
        intervalId = setInterval(async () => {
            if (index >= symbolsAndPrices.length) {
                clearInterval(intervalId);
                finalBbands = finalArray.sort((a, b) => parseFloat(a.diff) - parseFloat(b.diff)).slice(0, 10);
                finalRsi = finalArray.sort((a,b)=>parseFloat(a.rsi) - parseFloat(b.rsi)).slice(0, 10);
                console.log("Updated Negative Bbands ", finalBbands);
                console.log("Updated Negative RSI ", finalRsi);
                return;
            }
            const { symbol, price } = symbolsAndPrices[index];
            const dataValues = await getIndicatorsData(symbol);
           
            if (dataValues.bbands) {
                const {bbands, rsi} = dataValues;
                console.log("MMY Data: ",symbolsAndPrices.length - index,  symbol, dataValues)
                const difference = price - bbands;
                const diff = ((difference / bbands) * 100).toFixed(3); //Percentage Difference
               
                finalArray.push({ symbol, diff, rsi });
                // console.log(symbolsAndPrices.length - index, " sec");
            }

            index += 1;
        }, 550);
    } catch (error) {
        console.error(error);
    }
}

async function getIndicatorsData(symbol) {
    let data = {}
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
                // console.log("Response : ", response.data.data);
                // console.log("Response: ", response.data.data[0].result.valueMiddleBand, response.data.data[1].result.value)
                data= {bbands: response.data.data[0].result.valueMiddleBand.toFixed(3), rsi: response.data.data[1].result.value.toFixed(0)}
                
            })
            .catch((error) => {
                console.error(error);
            });
            return data;
    } catch (error) {
        return false;
    }
}

fetchUsdtPairsWithIndicatorsData();
setInterval(() => {
    try {
        console.log("Iteration Count: ", operationalCount++);
        clearInterval(intervalId);
        fetchUsdtPairsWithIndicatorsData();
    } catch (e) {
        console.log("Error: ", e);
    }
}, 250000);
