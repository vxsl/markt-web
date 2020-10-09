const   config = require("../config.js"),
        readline = require('readline'),
        wealthsimple = require("wstrade-api"),
        trade = wealthsimple.default,
        { getSession } = require("./credentials.js")


var fakePositions = []
var fakeInitBalance, fakeCurrentBalance

var session, tokens,
    account, accountID,
    actualPositions, actualPositionQuantities   // TODO delete?

const main = async () => {
    await init()
    // do other stuff
}

const fakePlaceMarketBuy = (tokens, accountId, ticker, quantity, price) => {

    let total = quantity*price
    console.log("Purchased " + quantity + " " + ticker + " ... total = " + total)
    fakeCurrentBalance -= total
    //positionBalance += total

    fakePositions.push ({
        ticker:ticker,
        average:price,
        quantity:quantity,        
        sold:false,
        net:0,
    })
    return {
        ticker:ticker,
        average:price,
        quantity:quantity,
        sold:false,
        net:0,
    }
}
const fakePlaceMarketSell = (tokens, accountId, ticker, quantity, price) => {
    
    let p = getFakePositionByTicker(ticker)
    let total = quantity*price
    console.log("Sold " + quantity + " " + ticker + " ... total = " + total)
    fakeCurrentBalance += total
    //positionBalance -= total

    let diff = (price - p.average)*quantity
    diff > 0? console.log("profited " + diff + " on " + ticker) :  console.log("lost " + Math.abs(diff) + " on " + ticker )
    
    p.net = diff.toFixed(2)
    p.sold=true
   
    return null
}

const init = async (auto=true) => {

    session = await getSession()  // get access tokens
    tokens = session.tokens

    // fetch AccountData and extract some of it
    let accountSet = await trade.getAccountData(tokens);
    account = await chooseAccount(accountSet, auto)
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
    
    fakeInitBalance = account.current_balance.amount
    fakeCurrentBalance = fakeInitBalance

    // fetch positions
    actualPositions = await trade.getPositions(tokens, accountID);

    // declare and populate array with relevant information about holdings:
	let actualPositionsArray = []
	for (let i = 0; i < Object.keys(actualPositionQuantities).length; i++) {      
        actualPositionsArray.push({
            id:Object.keys(actualPositionQuantities)[i],
            quantity:Object.values(actualPositionQuantities)[i],
            value:actualPositions[i].quote.amount
        })
    }
    
    return 
}

// Find a non-TFSA, non-crypto account
const chooseAccount = async (accountSet, auto) => {
    
    let result = null
    for (let i = 0; i < accountSet.results.length; i++) {
        if (accountSet.results[i].id.includes('tfsa') || accountSet.results[i].id.includes('crypto')) continue
        else {
            result = accountSet.results[i]
            break
        }
    }
    if (result !== null && !auto) {
        while (true) {
            let userResponse = await userPrompt("Selecting " + result.id + " (balance " + result.current_balance.amount + ", created " + result.created_at + "). \nOK?: [y/n] ");
            if (userResponse === 'y' || userResponse === 'Y') {
                return result
            }
            else if (userResponse === 'n' || userResponse === 'N') {
                return 0
            }
        }
    }
    else if (auto) return result   
    else return 1
}

const placeInitialOrders = async(recommendedPositions) => {

    let t = []
    let failureCount = 0
    for (p in recommendedPositions) {
        let ticker = recommendedPositions[p].stock.symbol.split(":")[0] + ":TSX"
        try {
            t.push(await trade.getSecurity(tokens, ticker, false))
            if (buy(ticker, recommendedPositions[p].stock.price) == 1) failureCount++
        }
        catch (error) {
            console.log("Sorry, " + ticker + " is not listed on Wealthsimple Trade.")
            failureCount++
        }
    }
    return failureCount
}

const displayActualPositions = () => {
    // display individual info
	for (let i = 0; i < fakePositions.length; i++) {
		console.log(fakePositions[i].quote.amount);
		console.log(fakePositions[i].quote.security_id);
		console.log(fakePositions[i].stock.symbol);
		console.log("******************")
		//console.log(currentTotal);
	}
}

const buy = async (ticker, modelPrice) => {

    let quantity = Math.floor(fakeInitBalance / (config.NUM_POSITIONS*modelPrice))
    //console.log("Going to BUY " + ticker + " x" + quantity + " at " + modelPrice)
    let confirmation = fakePlaceMarketBuy(tokens, accountID, ticker, quantity, modelPrice)
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

const sell = async (ticker, modelPrice) => {

    let quantity = getFakePositionByTicker(ticker).quantity
    //console.log("Going to SELL " + ticker + " x" + quantity + " at " + modelPrice)
    let confirmation = fakePlaceMarketSell(tokens, accountID, ticker, quantity, modelPrice)
}

const userPrompt = (message) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(message, ans => {
        rl.close();
        resolve(ans);
    }))
}

const getFakePositionByTicker = (ticker) => {
    for (let i = 0; i < fakePositions.length; i++) {
        if (fakePositions[i].ticker.split(":")[0] == ticker.split(":")[0]) return fakePositions[i]
        // TODO make it so the market view uses :TSX instead of :CT, or make it so it just has the first part before :.
        // TODO more generally, just unify the market and agent views. Why is there redundant data in the first place?
	}
}

module.exports = {
    sell,
    init,
    fakePositions,
    getFakePositionByTicker,
    placeInitialOrders
}

