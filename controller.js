const market = require("./market.js")
const agent = require("./agent/agent.js")
const config = require("./config.js")
const fs = require("fs")

/**
 * delays execution of function fn until time "XX:XX". 
 * If async, return a promise.
 */
const waitUntil = (fn, time, async=false) => {

    let now = new Date();
    let then = new Date(now.getFullYear(), now.getMonth(), now.getDate(), time.split(":")[0], time.split(":")[1], 0, 0)
    let msUntil = then - now;
    
    console.log("\nIt is " + now.toLocaleTimeString() + ". Waiting until " + then.toLocaleTimeString() + " to execute " + fn.name + ".")

    if (!async) {        
        setTimeout( fn, 1);
    }
    else {
        return new Promise(function(resolve, reject) {
            setTimeout(() => {
                resolve(async () => {
                    return await fn()
                })
            }, msUntil);
        });
    }
}

market.buySellEmitter.on("sell", async (ticker, price) => {
    if (agent.getFakePositionByTicker(ticker).sold === false) {
        await agent.sell(ticker, price)    
    }
    writePositionsToJSON()
})  

const writePositionsToJSON = () => {
    let data = agent.fakePositions
    let filename = "positions.json"
    fs.writeFileSync(config.fileDir+filename, JSON.stringify(data))
}

const main = async() => {
        
    await agent.init()      
    let getRecommendedPositions = await waitUntil(market.init, "08:58", true) 
    let recommendedPositions = await getRecommendedPositions()  
    let buyErrors = await agent.placeInitialOrders(recommendedPositions)
    buyErrors > 0? console.log("\nOnly " + (recommendedPositions.length - buyErrors) + " orders were successful.") : console.log("\nAll orders were successful.")
    writePositionsToJSON()

    // TODO what happens when a marketBuy is placed before the market opens?

    waitUntil(market.main, "09:28", false)
}


main()