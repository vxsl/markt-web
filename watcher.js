const market = require("./market.js")
const agent = require("./agent/agent.js")
const config = require("./config.js")
const fs = require("fs")



market.buySellEmitter.on("sell", async (symbol, price) => {
    //console.log("\n\n\nPlease sell position " + i + ": " + positions[i].stock.symbol + ".\n\n\n")
    if (agent.getPositionByTicker(symbol).sold === false) {
        await agent.sell(symbol, price)    
    }
    writeActualPositions()
})  

market.buySellEmitter.on("buy", async (symbol, price) => {
    await agent.buy(symbol, price)
    writeActualPositions()
})

const main = async() => {
    await agent.init()
    market.main()
}

const writeActualPositions = () => {
    let data = agent.positions
    let filename = "positions.json"
    fs.writeFileSync(config.fileDir+filename, JSON.stringify(data))
}
main()