const 	config = require('../config.js'),
		tools = require('../tools/tools.js'),
		{ QuoteHarvester } = require("./bnnbloomberg-markets-scraper"),
		{ EventEmitter } = require("events"),
		{ Position } = require ("./Position.js")

const buySellEmitter = new EventEmitter()

var positionModel = []
var market = []
var currentTimestamp, lastTimestamp

var positions = []
var recommendedPositions = []

const main = async () => {
	
	let tmp = await quoters[0].quote()
	market = [...tmp.data.stocks]
	sortStocks(market, 'pctChng')
	currentTimestamp = Date.parse(tmp.generatedTimestamp)
	
	while (true) {	
		updateMarket(await quoters[0].quote())
	}
}

const alterPicks = (gainers) => {

	// get only cheap gainers < $2.00
	let result = []
	for (i in gainers) {
		if (gainers[i].price < 2) result.push(gainers[i])
		//if (gainers[i].symbol == "DIV:CT") result.push(gainers[i])
	}
	return result.slice(0, config.NUM_POSITIONS)
}

const recommendPositions = async () => {
	
	tools.log("Going to recommend " + config.NUM_POSITIONS + " positions.")
	// initialize market model:
	let market = await (await QuoteHarvester.build("ca")).quote()	

	tools.log("TSX market model retrieved (" + market.data.stocks.length + " stocks).\n")	

	let gainers = alterPicks(sortStocks(market.data.stocks, 'pctChng'))
	//let gainers = sortStocks(market.data.stocks, 'pctChng').slice(0, config.NUM_POSITIONS)
	currentTimestamp = Date.parse(market.generatedTimestamp)

	tools.log("\nOK, the top " + config.NUM_POSITIONS + " gainers are as follows:\n")
	gainers.forEach(s => {
		tools.log("|\t [ " + s.symbol + " ]\t"  + s.price + "\t" + s.pctChng.toFixed(2) + "%\t\t(" + s.name + ")") 
		// it seems that every day at 9:00 EST (30 min before the opening bell), BNN Bloomberg resets the daily gain/loss stats on their "market movers." I am setting this function to run shortly before that time, so hopefully this case is avoided. 
		if (s.pctChng < 0.01) throw "BNN Bloomberg is not providing correct market data, so it is not possible to recommend positions."
	})

	//await gainers.forEach(async s => {
	for (let s in gainers) {
		let p = await Position.build({
				ticker:	gainers[s].symbol,
				price:{
					current:gainers[s].price,
					history:[{value: gainers[s].price, timestamp: currentTimestamp}],				
					min:gainers[s].price,
					max: gainers[s].price,
					average:gainers[s].price 
				}
			})
		recommendedPositions.push(p)
	}

	return recommendedPositions
}

// TODO check to make sure trade.getPositions() data is not 15 minutes behind. Maybe better to use buy confirmations?
const confirmPositions = async (actualPositions, recommendedOnly=false) => {

	let inconsistencies = 0

	for (let i in actualPositions) {	
		let p = actualPositions[i] 		
		let el, diff, s
		try {
			if (recommendedOnly) {
				el = await agent.getPositionByTicker(p.stock.symbol)
				diff = Math.abs(p.quote.amount - el.price.average)
				s = p.stock.symbol + " was purchased for "
				diff != 0?  diff < 0? s += "$" + diff + " less than expected." : s += "$" + diff + " more than expected." : s += " the expected price."
				s? tools.log(s) : null
			}
			else {
				el = await agent.getPositionByTicker(p.stock.symbol, true)
			}
		} 
		catch (error) {				
			inconsistencies++
			tools.log("Signalling to cancel/sell " + p.stock.symbol + "...")
			buySellEmitter.emit("cancel", p.stock.symbol)
			delete el // is this correct?
		}
	}
	
	if (inconsistencies > 0) {
		tools.log("In comparing the position model and the actual positions on WS, " + inconsistencies + " inconsistencies were found.")
		throw inconsistencies
	}
	else {
		
	}


	let i, currentPrice, newPrice
	let changeCount = 0
	let s = ''
	for (let i = 0; i < positionModel.length; i++) {
		i = positionModel[i]
		currentPrice = i.price.current
		newPrice = getStockBySymbol(i.stock.symbol).price
		
		if (currentPrice != newPrice) {
			i.price.current = newPrice
			i.price.history.unshift({value:newPrice, timestamp: currentTimestamp})

			// extra stuff:
			if (newPrice < i.price.min) {
				i.price.min = newPrice
			}
			else if (newPrice > i.price.max) {
				i.price.max = newPrice
			}			
			s += (i.stock.symbol + " ")
			s += (newPrice - currentPrice > 0) ? "jumped" : "fell"
			s += (" from " + currentPrice.toFixed(2) + " to " + newPrice.toFixed(2) + "...\n")	
			changeCount++
		}

		
		if (currentPrice > newPrice) buySellEmitter.emit("sell", i.stock.symbol, newPrice)
	}			
	//if (s) tools.log(s)
	/* if (changeCount > 0) {
		log(changeCount + " OF YOUR POSITIONS HAVE CHANGED IN VALUE:")
		log("-------------------------------------------")
		displayPositions()
	} */

	tools.writeJSON(positionModel, "stocks.json")
}

const evaluatePositionModel = () => {

	let p, currentPrice, newPrice
	let changeCount = 0
	let s = ''
	for (let i = 0; i < positionModel.length; i++) {
		p = positionModel[i]
		currentPrice = p.price.current
		newPrice = getStockBySymbol(p.stock.symbol).price
		
		if (currentPrice != newPrice) {
			p.price.current = newPrice
			p.price.history.unshift({value:newPrice, timestamp: currentTimestamp})

			// extra stuff:
			if (newPrice < p.price.min) {
				p.price.min = newPrice
			}
			else if (newPrice > p.price.max) {
				p.price.max = newPrice
			}			
			s += (p.stock.symbol + " ")
			s += (newPrice - currentPrice > 0) ? "jumped" : "fell"
			s += (" from " + currentPrice.toFixed(2) + " to " + newPrice.toFixed(2) + "...\n")	
			changeCount++
		}

		
		if (currentPrice > newPrice) buySellEmitter.emit("sell", p.stock.symbol, newPrice)
	}			
	//if (s) tools.log(s)
	/* if (changeCount > 0) {
		log(changeCount + " OF YOUR POSITIONS HAVE CHANGED IN VALUE:")
		log("-------------------------------------------")
		displayPositions()
	} */

	tools.writeJSON(positionModel, "stocks.json")
}

/*=========================================
=            POLLING FUNCTIONS            =
=========================================*/

const updateMarket = (quote) => {

	simulateMarketAction(quote)

	lastTimestamp = currentTimestamp
	currentTimestamp = Date.parse(quote.generatedTimestamp)

	if (currentTimestamp < lastTimestamp) {
		tools.log("BNNBloomberg's API blew it this time...")
		return
	}
	if (marketDiff(sortStocks(quote.data.stocks, 'pctChng'))) {
		market = [...quote.data.stocks]	
		displayMarket()
	}
	else if (lastTimestamp != currentTimestamp) {
		
	tools.refreshLog(currentTimestamp,"Nothing to report...")
	}

	evaluatePositionModel()	
}

const simulateMarketAction = (quote) => {
	if (Math.random() > 0.5) {
		for (let i = 0; i < quote.data.stocks.length; i++) {
			//log(cur.data.stocks[i])
			if (Math.random() > 0.3) {
				if (Math.random() > 0.5) {
					quote.data.stocks[i].price = getStockBySymbol(quote.data.stocks[i].symbol).price + Math.random()
				} else {
					quote.data.stocks[i].price = getStockBySymbol(quote.data.stocks[i].symbol).price - Math.random()
				}
			}		
		}
	}
}

/*----------  Polling helpers  ----------*/

// Returns true iff there is a difference in price found in the entire market
const marketDiff = (stockArr, n=market.length) => {

	for (let i = 0; i < n; i++) {
		if (stockArr[i].price != getStockBySymbol(stockArr[i].symbol).price) {			
			return true
		}
	}
	return false
}

/*
const stockDiff	= (stock, newIndex) => {
	//log("stockDiff(" +stock.symbol +")")
	let oldIndex = market.findIndex(s  => s.symbol == stock.symbol); 
	//log("old index of " + stock.symbol + " is " + oldIndex )
	//log("new index of " + stock.symbol + " is " + newIndex + "\n\n")
	if (newIndex != oldIndex) {
		process.stdout.write(stock.symbol)
		let a = (newIndex - oldIndex > 0) ? "jumped" : "fell"
		process.stdout.write(a +" from " + oldIndex + " to " + newIndex + "...\n")
	}	                
}*/

const displayMarket = async (n=10) => {

	// TODO only log if there is a difference in price in the stocks we care about
	tools.refreshLog(currentTimestamp, "New update.", " [" + ((Date.now() - currentTimestamp) / 1000) + " seconds late]")
	/*for (let i = 0; i < n; i++) {
		log(market[i].symbol + "  \t" + market[i].price.toFixed(2) + "\t\t+" + market[i].pctChng.toFixed(2) + "%")
	}
	log("\n")*/
}

const displayPositionModel = async () => {

	//log("Position model: ")
	let p, priceDiff
	for (let i = 0; i < positionModel.length; i++) {
		p = positionModel[i]
		priceDiff = p.price.history[0].value - p.price.average
		tools.log(p.stock.symbol + "  \t@ " + p.price.history[0].value.toFixed(2) + "  \t" + priceDiff.toFixed(2))
	}
}

const getStockBySymbol = (symbol) => {
	for (let i = 0; i < market.length; i++) {
		if (market[i].symbol == symbol) return market[i]
	}
}

const getPositionByTicker = (ticker, recommendedOnly=false) => {
	
	let stripped = ticker.split(":")[0]
	if (!recommendedOnly) {
		for (p in positions) {
			if (positions[p].ticker == stripped) return positions[p]
		}
	}
	else {
		for (p in recommendPositions) {
			if (recommendPositions[p].ticker == stripped) return recommendedPositions[p]
		}
	}
	throw stripped + " didn't match any positions in the model. Something went wrong."
}

const sortStocks = (stockArr, sortBy) => {
	
	switch(sortBy) {
		case "pctChng":
			stockArr.sort((a, b) => b.pctChng - a.pctChng)
			break
	}
	
	return stockArr
}



/*===============================
=            Program            =
===============================*/


module.exports = {
	recommendPositions,
	confirmPositions,
	positionModel,
	buySellEmitter,
	main,
}