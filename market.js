const 	config = require("./config.js"),
		scraper = require("./bnnbloomberg-markets-scraper")

const 	fs = require('fs'),
    	child_process = require('child_process');

const { EventEmitter } = require("events");
const buySellEmitter = new EventEmitter()

const debug = true

var positionModel = []
var market = []
var currentTimestamp, lastTimestamp

process.chdir('/var/www/html/kylegrimsrudma.nz/scalping-agent/')

const main = async () => {
	
	let tmp = await getNewQuote()
	market = [...tmp.data.stocks]
	sortStocks(market, 'pctChng')
	currentTimestamp = Date.parse(tmp.generatedTimestamp)
	
	while (true) {	
		updateMarket(await getNewQuote())
	}
}

const init = async () => {
	log("\nInitializing...")
	log("Going to recommend " + config.NUM_POSITIONS + " positions.")
	let recommendedPositions = await recommendPositions()	
	log("Market model initialized with " + market.length + " stocks.\n")
	
	// show initial state of market:
	displayMarket()
	displayPositionModel()

	positionModel = recommendedPositions	// TODO remove this

	return recommendedPositions
}

const recommendPositions = async () => {
	
	let tentativePositionModel = []

	// initialize bnnbloomberg-markets-scraper
	await scraper.initialize(0)

	// initialize market model:
	let tmp = await getNewQuote()
	market = [...tmp.data.stocks]
	sortStocks(market, 'pctChng')
	currentTimestamp = Date.parse(tmp.generatedTimestamp)

	// initialize model for recommended positions:
	for (let i = 0; i < config.NUM_POSITIONS; i++) {
		//buySellEmitter.emit("buy", market[i].symbol, market[i].price)
		tentativePositionModel.push({
			stock:market[i],
			price:{
				current:market[i].price,
				history:[{value: market[i].price, timestamp: currentTimestamp}],				
				min:market[i].price,
				max: market[i].price,
				average:market[i].price 
			}
		})		
	}

	return tentativePositionModel
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
	if (s) log(s)
	/* if (changeCount > 0) {
		log(changeCount + " OF YOUR POSITIONS HAVE CHANGED IN VALUE:")
		log("-------------------------------------------")
		displayPositions()
	} */

	writeJSON(positionModel, "stocks.json")
}


/*=========================================
=            POLLING FUNCTIONS            =
=========================================*/

const getNewQuote = async () => {

	let newQuote = await scraper.poll()
	while (true) {
		if (newQuote != 1) break
		newQuote = await scraper.poll()
	}
	return newQuote
}

const updateMarket = (cur) => {

	//fakeMarket(cur)

	lastTimestamp = currentTimestamp
	currentTimestamp = Date.parse(cur.generatedTimestamp)

	if (currentTimestamp < lastTimestamp) {
		log("BNNBloomberg's API blew it this time...")
		return
	}
	if (marketDiff(sortStocks(cur.data.stocks, 'pctChng'))) {
		market = [...cur.data.stocks]	
		displayMarket()
	}
	else if (lastTimestamp != currentTimestamp) {
		
		nothingLog("\n" + epochToTimeString(currentTimestamp) + " -> Nothing to report...\n")
	}

	evaluatePositionModel()	
}

const fakeMarket = (cur) => {
	for (let i = 0; i < cur.data.stocks.length; i++) {
		//log(cur.data.stocks[i])
		if (Math.random() > 0.3) {
			if (Math.random() > 0.5) {
				cur.data.stocks[i].price = getStockBySymbol(cur.data.stocks[i].symbol).price + Math.random()
			} else {
				cur.data.stocks[i].price = getStockBySymbol(cur.data.stocks[i].symbol).price - Math.random()
			}
		}
		
	}
}

/*----------  Polling helpers  ----------*/

/**
 * Returns true iff there is a difference in price found in the entire market
 * 
 * // TODO make this happen only for stocks that we care about (i.e. positions)
 * 
 * @param {*} stockArr 
 * @param {*} n 
 */
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

/*=============================	============
=            DISPLAY FUNCTIONS            =
=========================================*/

const displayMarket = async (n=10) => {

	// TODO only log if there is a difference in price in the stocks we care about

	log("Update stamped " + epochToTimeString(currentTimestamp) + ". (" + ((Date.now() - currentTimestamp) / 1000) + " seconds late)" )
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
		log(p.stock.symbol + "  \t@ " + p.price.history[0].value.toFixed(2) + "  \t" + priceDiff.toFixed(2))
	}
	log("\n")
}

const epochToTimeString = (epochString) => {
	let d = new Date(epochString)
	return d.toLocaleTimeString().replace(" PM", ":" + d.getMilliseconds() +" PM").replace(" AM", ":" + d.getMilliseconds().toString().slice(-3) +" AM")
}

/*=====================================
=            MISC. HELPERS            =
=====================================*/

const writeJSON = async (data, filename) => {
	fs.writeFile(config.fileDir+filename, JSON.stringify(data), (err) => {
		if (err != null) {
			log(err)
		}
	})
}

const getStockBySymbol = (symbol) => {
	for (let i = 0; i < market.length; i++) {
		if (market[i].symbol == symbol) return market[i]
	}
}

const sortStocks = (stockArr, sortBy) => {
	
	switch(sortBy) {
		case "pctChng":
			stockArr.sort((a, b) => b.pctChng - a.pctChng)
			break
	}
	
	return stockArr
}

const log = (message) => {
	
	fs.appendFileSync(config.fileDir+'log', message+"\n")
	/* fs.appendFile(config.fileDir+'log', message+"\n", function (err) {
		if (err) throw err;
	});
	if (debug) console.log(message) */
}

// special fn to avoid writing "Nothing to report..." over and over again
const nothingLog = async (message) => {

	let filename = config.fileDir+'log'	
	fs.openSync(filename, 'r+')

	// remove redundant line from end of log
	let stdout = child_process.execSync('tail -n 3 '+filename)
	let stat = fs.statSync(filename)
	if (stdout.includes("Nothing to report")) {
		fs.truncateSync(filename, stat.size - stdout.length)
	}
	
	// replace with new line
	fs.appendFileSync(filename, message+"\n")
	if (debug) console.log(message)	
}

/*===============================
=            Program            =
===============================*/


module.exports = {
	positionModel,
	init,
	buySellEmitter,
	main,
	writeJSON
}