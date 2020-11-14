const 	config = require('../config.js'),
		tools = require('./tools/tools.js'),
		{ log } = require('../tools/tools.js'),
		{ writeJSON } = require('../tools/tools.js'),
		{ QuoteHarvester } = require("./bnnbloomberg-markets-scraper"),
		{ EventEmitter } = require("events"),
		{ Position } = require ("./Position.js")

const buySellEmitter = new EventEmitter()

var modelPositions = []

const createPosition = async (ticker) => {

	let result = await Position.build(ticker)
	return result
}

const main = async () => {
	
	//let market = await (await QuoteHarvester.build("ca")).quote()
	//console.log(market.data.stocks)
	/* let p
	// TODO there is a race condition leading to deadlock somewhere in here??
	while (true) {	
		//for (let i in modelPositions) {
		for (let i = 0; i < modelPositions.length; i++) {
			p = modelPositions[i]
			if (!p.lock) {
				p.lock = 1
				updateEvaluate(i)
			}
			else await new Promise(resolve => setTimeout(resolve, 1000));
		}
	} */
}

// TODO create some enumerable optfions here
const selectionStrategy = (market, sort="pctChng") => {
	
	log("\nSelected buying strategy: top gainers")

	switch(sort) {
		case "pctChng":
			market.sort((a, b) => b.pctChng - a.pctChng)
			break
		case "totalVolume":
			market.sort((a, b) => b.totalVolume - a.totalVolume)
			break	
	}	

	// get only cheap gainers < $7.00
	let result = []
	for (let i = 0; i < market.length; i++) {
		if (market[i].price < 7) result.push(market[i])
		if (result.length == config.NUM_POSITIONS) break
	}

	/* // get top gainers
	let result = []
	for (let i = 0; i < config.NUM_POSITIONS; i++) {
		result.push(market[i])
	} */

	if (result.length != config.NUM_POSITIONS) throw "Something went wrong selecting positions."
	
	log("\nOK, the top " + config.NUM_POSITIONS + " gainers are as follows:\n")
	return result
}

const recommendPositions = async () => {
	
	console.log("HERRE")
	log("Going to recommend " + config.NUM_POSITIONS + " positions.")
	
	// get initial market model:
	let market = await (await QuoteHarvester.build("ca")).quote()
	log("TSX market model retrieved (" + market.data.stocks.length + " stocks).\n")	
	
	let selectedStocks = selectionStrategy(market.data.stocks, "totalVolume")

	selectedStocks.forEach(s => {
		log("|\t [ " + s.symbol + " ]\t"  + s.price + "\t" + s.pctChng.toFixed(2) + "%\t\t(" + s.name + ")") 
		// it seems that every day at 9:00 EST (30 min before the opening bell), BNN Bloomberg resets the daily gain/loss stats on their "market movers." I am setting this function to run shortly before that time, so hopefully this case is avoided. 

		// TODO uncomment 
		//if (s.pctChng < 0.01) throw "BNN Bloomberg is not providing correct market data, so it is not possible to recommend positions."
	})

	for (let s in selectedStocks) {
		let p = await Position.build(selectedStocks[s].symbol, {
				current:selectedStocks[s].price,
				history:[{value: selectedStocks[s].price, timestamp: Date.parse(market.generatedTimestamp).toString()}],				
				min:selectedStocks[s].price,
				max: selectedStocks[s].price,
				average:selectedStocks[s].price 
			})
		modelPositions.push(p)
	}

	return modelPositions
}

// TODO check to make sure trade.getPositions() data is not 15 minutes behind. Maybe better to use buy confirmations?
const confirmPositions = async (actualPositions) => {

	let inconsistencies = 0

	for (let i in actualPositions) {	
		let p = actualPositions.results[i] 		
		let el, diff, s
		try {
			el = getModelPositionByTicker(p.stock.symbol)
			diff = Math.abs(p.quote.amount - el.price.average)

			s = p.stock.symbol + " was purchased for "		
			if (diff < 0) {
				s += "$" + diff + " less than expected."
				s += "\nDecreasing the model position's average price to $" + p.quote.amount 
				el.price.average = p.quote.amount
				if (el.price.average == p.quote.amount) {
					s += "\n...Success."
				} else throw "Something went wrong changing the average price for model position " + el.ticker
			}
			else if (diff > 0) {
				s += "$" + diff + " more than expected."
				s += "\nIncreasing the model position's average price to $" + p.quote.amount 
				el.price.average = p.quote.amount
				if (el.price.average == p.quote.amount) {
					s += "\n...Success."
				} else throw "Something went wrong changing the average price for model position " + el.ticker
			}
			else {
				s += " the expected price."
			}
			s? log(s) : null
		} 
		catch (error) {				
			inconsistencies++
			log("Signalling to cancel/sell " + p.stock.symbol + "...")
			buySellEmitter.emit("cancel", p.stock.symbol)
			delete el // is this correct?
		}
	}
	
	if (inconsistencies > 0) {
		log("In comparing the position model and the actual positions on WS, " + inconsistencies + " inconsistencies were found.")
		throw inconsistencies
	}
	else {
		log("Model positions OK")
	}

		(modelPositions, "modelPositions.json")
}

const updateEvaluate = async (i) => {

	let p = modelPositions[i]
	
	let newQuote = await p.quoter.quote()
	let newTimestamp = Date.parse(newQuote.generatedTimestamp).toString()

	if (newTimestamp > p.price.history[0].timestamp) {
		tools.refreshLog(i, newTimestamp, p.ticker + ": New update.", " [" + ((Date.now() - newTimestamp) / 1000) + " seconds late]")
		let newPrice = newQuote.data.stocks[0].price		
		let currentPrice = p.price.current

		let s = ''
		
		if (currentPrice != newPrice) {
			p.price.current = newPrice
			p.price.history.unshift({value:newPrice, timestamp: newTimestamp})

			// extra stuff:
			if (newPrice < p.price.min) {
				p.price.min = newPrice
			}
			else if (newPrice > p.price.max) {
				p.price.max = newPrice
			}			
			s += (p.ticker + " ")
			s += (newPrice - currentPrice > 0) ? "jumped" : "fell"
			s += (" from " + currentPrice.toFixed(2) + " to " + newPrice.toFixed(2) + "...\n")	
		}
		
		if (currentPrice > newPrice) buySellEmitter.emit("sell", p.ticker, newPrice)
			
		s? log(s) : null
		writeJSON(modelPositions, "modelPositions.json")
	}
	else {
		tools.refreshLog(i, newTimestamp, p.ticker + ": Nothing to report...")
	}
	p.lock = 0
}

const getModelPositionByTicker = (ticker) => {
	
	let stripped = ticker.split(":")[0]
	for (p in modelPositions) {
		if (modelPositions[p].ticker == stripped) return modelPositions[p]
	}
	throw stripped + " didn't match any positions in the model. Something went wrong."
}

/*===============================
=            Misc.              = 
===============================*/

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

/* module.exports = {
	recommendPositions,
	confirmPositions,
	modelPositions,
	buySellEmitter,
	main,
} */

module.exports = {
	createPosition
}