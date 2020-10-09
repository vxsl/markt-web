const config = require("../config.js")
const readline = require('readline');
//import trade from "wstrade-api"
const wealthsimple = require("wstrade-api")
const trade = wealthsimple.default
var positions = []

const fakePlaceMarketBuy = (tokens, accountId, ticker, quantity, price) => {

    let total = quantity*price
    console.log("Purchased " + quantity + " " + ticker + " ... total = " + total)
    currentBalance -= total
    positionBalance += total

    positions.push ({
        ticker:ticker,
        average:price,
        quantity:quantity,
        net:0,
        sold:false    
    })
    return null
}
const fakePlaceMarketSell = (tokens, accountId, ticker, quantity, price) => {
    
    let p = getPositionByTicker(ticker)
    let total = quantity*price
    console.log("Sold " + quantity + " " + ticker + " ... total = " + total)
    currentBalance += total
    positionBalance -= total

    let diff = (price - p.average)*quantity
    diff > 0? console.log("profited " + diff + " on " + ticker) :  console.log("lost " + Math.abs(diff) + " on " + ticker )
    
    p.net = diff.toFixed(2)
    p.sold=true
   
    return null
}
//const { trade } = require("./fake-wstrade-api.js")

const { getSession } = require("./credentials.js")

var session
var account
var id, positionQuantities
var actualPositions
var atualPositionsArray = []
var history

var initBalance, currentBalance, positionBalance

const main = async () => {
    await init()
    // do other stuff
}

const init = async () => {

    session = await getSession()  // get access tokens
    
    // fetch AccountData and extract some of it
    let accountSet = await trade.getAccountData(session.tokens);
    account = await chooseAccount(accountSet)
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
	id = account.id;
    positionQuantities = account.position_quantities;
    
    initBalance = account.current_balance.amount
    currentBalance = initBalance
    // TODO remove this
    if (initBalance < 150) {
        initBalance = 150
    }

    // fetch positions
    actualPositions = await trade.getPositions(session.tokens, id);

    // declare and populate array with relevant information about holdings:
	let actualPositionsArray = []
	for (let i = 0; i < Object.keys(positionQuantities).length; i++) {      
        actualPositionsArray.push({
            id:Object.keys(positionQuantities)[i],
            quantity:Object.values(positionQuantities)[i],
            value:actualPositions[i].quote.amount
        })
    }
    
    return 
	//console.log(actualPositionsArray)

	// ...
	/* history = await trade.getHistory(session.tokens, '1d', id); */

    /* displayActualPositions() */
}

// Find a non-TFSA, non-crypto account
const chooseAccount = async (accountSet) => {

    let result = null
    for (let i = 0; i < accountSet.results.length; i++) {
        if (accountSet.results[i].id.includes('tfsa') || accountSet.results[i].id.includes('crypto')) continue
        else {
            result = accountSet.results[i]
            break
        }
    }
    if (result !== null) {
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
    else {
        
        return 1
    }
}

const displayActualPositions = () => {
    // display individual info
	for (let i = 0; i < positions.length; i++) {
		console.log(positions[i].quote.amount);
		console.log(positions[i].quote.security_id);
		console.log(positions[i].stock.symbol);
		console.log("******************")
		//console.log(currentTotal);
	}
}

const buy = async (ticker, price) => {

    let quantity = Math.floor(initBalance / (config.NUM_POSITIONS*price))

    console.log("Going to BUY " + ticker + " x" + quantity + " at " + price)

    let confirmation = fakePlaceMarketBuy(session.tokens, account.id, ticker, quantity, price)
}

const sell = async (ticker, price) => {

    let quantity = getPositionByTicker(ticker).quantity
    console.log("Going to SELL " + ticker + " x" + quantity + " at " + price)

    let confirmation = fakePlaceMarketSell(session.tokens, account.id, ticker, quantity, price)
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

const getPositionByTicker = (ticker) => {
    for (let i = 0; i < positions.length; i++) {
		if (positions[i].ticker == ticker) return positions[i]
	}
}




module.exports = {
    buy,
    sell,
    init,
    main,
    positions,
    getPositionByTicker
}

