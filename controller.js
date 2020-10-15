const   market = require("./market/market.js"),
        agent = require("./agent/agent.js"),
        config = require("./config.js"),
        tools = require("./tools/tools.js"),
        fs = require("fs")

// tries to cancel, but will resort to selling if the order has already gone through
market.buySellEmitter.on("cancel", async (ticker, price) => {
    let p = await agent.getPositionByTicker(ticker)
    if (p.sellable_quantity == 0) { // TODO check if this condition makes sense   
        await agent.cancel(ticker).catch(market.buySellEmitter.emit("sell", ticker))   
    }
    else market.buySellEmitter.emit("sell", ticker)

    writePositionsToJSON()
})  

// TODO add pause condition if there is going to be an overly significant net loss? 
market.buySellEmitter.on("sell", async (ticker, price) => {
    let p = await agent.getPositionByTicker(ticker)
    if (p.sellable_quantity > 0) {
        await agent.sell(ticker, price)    
    }
    writePositionsToJSON()
})  

const writePositionsToJSON = () => {
    let data = agent.fake.fakePositions
    let filename = "positions.json"
    fs.writeFileSync(config.fileDir+filename, JSON.stringify(data))
}

const main = async() => {

    let safe = await tools.safePrompt()
    
    tools.log("\nInitializing Wealthsimple connection...")			
    await agent.init()      

    tools.log("\nInitializing BNN Bloomberg API connections...")
    // TODO use https://ca.finance.yahoo.com/gainers/ instead to recommend gainers? Investigate API
    // Yahoo doesn't seem to reset their stats at 9:00am like BNN and Tradingview.
    // Would have to filter, because the Yahoo list includes a lot of stocks that are not on BNN list.
    let recommendedPositions = await (await tools.delayFunctionCall(market.recommendPositions, "08:58", true))()
    
    if (!safe) {
        tools.log("\nPlacing Wealthsimple orders based on recommended positions...")

        let initialOrders = await agent.placeInitialOrders(recommendedPositions)
        initialOrders.errors > 0? console.log("\nOnly " + (recommendedPositions.length - initialOrders.errors) + " orders were successful.") : console.log("\nAll orders were successful.")
        writePositionsToJSON()

        tools.log("\nDouble-checking that the position model and actual positions are identical...")
        // get price diffs
        await market.confirmPositions(initialOrders.actualPositions.results)
    }

    // TODO what happens when a marketBuy is placed before the market opens?

    tools.delayFunctionCall(market.main, "09:28", false)  // TODO change to "09:28"
}




main()