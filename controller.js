const   market = require("./market/market.js"),
        config = require("./config.js"),
        tools = require("./tools/tools.js"),
        fs = require("fs")


// TODO add pause condition if there is going to be an overly significant net loss? 
market.buySellEmitter.on("sell", async (ticker, price) => {
    /* tools.log("Trying to sell " + ticker + " for $" + price + " per share")
    let p = await agent.getPositionByTicker(ticker)
    if (p.sellable_quantity > 0) {
        await agent.sell(ticker, price)    
    }
    writePositionsToJSON() */
    tools.log("Selling " + ticker)
})  

const writePositionsToJSON = () => {
    let data = agent.fake.fakePositions
    let filename = "positions.json"
    fs.writeFileSync(config.fileDir+filename, JSON.stringify(data))
}

const main = async() => {

    //let safe = await tools.safePrompt()
    //tools.log("\nInitializing BNN Bloomberg API connections...")
    // TODO use https://ca.finance.yahoo.com/gainers/ instead to recommend gainers? Investigate API
    // Yahoo doesn't seem to reset their stats at 9:00am like BNN and Tradingview.
    // Would have to filter, because the Yahoo list includes a lot of stocks that are not on BNN list.
    //let recommendedPositions = await (await tools.delayFunctionCall(market.recommendPositions, "08:58", true))()
    //market.recommendPositions()
    /* if (!safe) {
        tools.log("\nPlacing Wealthsimple orders based on recommended positions...")

        let initialOrders = await agent.placeInitialOrders(recommendedPositions)
        initialOrders.errors > 0? console.log("\nOnly " + (recommendedPositions.length - initialOrders.errors) + " orders were successful.") : console.log("\nAll orders were successful.")
        writePositionsToJSON()

        tools.log("\nDouble-checking that the position model and actual positions are identical...")
        // get price diffs
        await market.confirmPositions(initialOrders.actualPositions.results)
    } */

    // TODO what happens when a marketBuy is placed before the market opens?

    //tools.delayFunctionCall(market.main, "09:28", false)  // TODO change to "09:28" // TODO change to async=true
    market.main()
    
    console.log('here2')
}




main()