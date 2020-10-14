const   config = require("../config.js"),
        tools = require("./tools/tools.js")
const   wealthsimple = require("wstrade-api"),
        trade = wealthsimple.default,
        { getSession } = require("./credentials.js")

const fake = require("./fake.js")

var initBalance

var session, tokens,
    account, accountID,
    positions, actualPositionQuantities   // TODO delete?

var positionRecords = []

const main = async () => {
    await init()
    // do other stuff
}


const init = async (auto=true) => {

    session = await getSession()  // get access tokens
    tokens = session.tokens

    // fetch AccountData and extract some of it
    let accountSet = await trade.getAccountData(tokens);
    account = await tools.chooseAccount(accountSet, auto)
    switch (account) {
        case 0:
            console.log("OK. Ending program.")
            return
            break
        case 1:
            console.log("There was an error finding an appropriate account to select. Ending program.")
            return
            break
        default:
            console.log("Selected " + account.id + "\n")
            break
    }
	accountID = account.id;
    actualPositionQuantities = account.position_quantities;
    
    initBalance = account.current_balance.amount
    fake.fakeCurrentBalance = initBalance

    // fetch positions
    await updatePositions()

   /*  // declare and populate array with relevant information about holdings:
	let actualPositionsArray = []
	for (let i = 0; i < Object.keys(actualPositionQuantities).length; i++) {      
        actualPositionsArray.push({
            id:Object.keys(actualPositionQuantities)[i],
            quantity:Object.values(actualPositionQuantities)[i],
            value:positions[i].quote.amount
        })
    } */
    
    return 
}


const placeInitialOrders = async(recommendedPositions) => {

    let t = []
    let failureCount = 0
    for (p in recommendedPositions) {
        let formattedTicker = tools.formatTicker(recommendedPositions[p].ticker)
        try {
            t.push(await trade.getSecurity(tokens, formattedTicker, false))
            if (await buy(formattedTicker, recommendedPositions[p].data.price.current) == 1) failureCount++
        }
        catch (error) {
            console.log("Sorry, " + formattedTicker + " is not listed on Wealthsimple Trade.")
            failureCount++
        }
    }
    await updatePositions()
    return {
        errors:failureCount, 
        positions:positions
    }
}

// TODO return 1 if fail, probably a throw is better
const buy = async (formattedTicker, modelPrice) => {
    
    //let quantity = Math.floor(initBalance / (config.NUM_POSITIONS*modelPrice))
    let quantity = 1

    //console.log("Going to BUY " + ticker + " x" + quantity + " at " + modelPrice)
    //let confirmation = fake.FakeData.placeMarketBuy(tokens, accountID, ticker, quantity, modelPrice)
    let confirmation = await trade.placeMarketBuy(tokens, accountID, formattedTicker, quantity).catch(error => {throw error})
    createPositionRecord(confirmation)
    await updatePositions() // too long of a wait?
    return confirmation

    /* let confirmation
    try {
        confirmation = await trade.placeMarketBuy(tokens, accountID, ticker, quantity)
        console.log("Successfully bought " + confirmation.body)
        // TODO get confirmation structure, calculate diff between modelPrice and confirmation.price
    }
    catch (error) {
        console.log("Couldn't buy " + ticker + " -- " + error.body.error)
        return 1
    } */
}

const sell = async (formattedTicker, modelPrice) => { 

    let quantity = (await getPositionByTicker(formattedTicker)).sellable_quantity
    //console.log("Going to SELL " + ticker + " x" + quantity + " at " + modelPrice)
    let confirmation = await trade.placeMarketSell(tokens, accountID, formattedTicker, quantity)
    //let confirmation = fake.FakeData.placeMarketSell(tokens, accountID, ticker, quantity, modelPrice)
}

const getPositionByTicker = async (ticker) => {

    if (ticker.split(":")[1] == "CT") {
        ticker = tools.formatTicker(ticker)
    } // TODO add other cases


    // TODO use trade.getSecurity() instead?
    await updatePositions()
    for (let i in actualPositions.results) {
        let p = actualPositions.results[i]

        if (p.stock.symbol == ticker) {
        //if (p.stock.symbol.split(":")[0] == ticker.split(":")[0]) {
            return p
        }
    }
    throw "Couldn't find position " + ticker + " in WS Trade portfolio."
}

const updatePositions = async () => {
    //positions = await fake.FakeData.getPositions(tokens, accountID)
    actualPositions = await trade.getPositions(tokens, accountID)
}

const createPositionRecord = (confirmation) => {
    let key = confirmation.security_id
    positionRecords.push({
        key: {
            average:confirmation.filled_at,
            quantity:confirmation.fill_quantity,
            orderTime:confirmation.created_at,
            fillPrice:undefined,
            sold:false,
        }
    })
}

module.exports = {
    sell,
    init,
    placeInitialOrders,
    getPositionByTicker,
    fake
}

