const scraper = require("./bnnbloomberg-markets-scraper")
const { PriceHistory } = require("./PriceHistory.js")

const NUM_POSITIONS = 4

class Position { 

	constructor (stock) {
		this.stock = {...stock}
		this.stock.price = this.stock.price.toFixed(2)	// make it pretty
		this.priceHistory = new PriceHistory(stock.price)
	}
}

var positions = []
var market = []
var timestamp, lastTimestamp

const main = async () => {
	
	console.log("\nInitializing...")
	await init()	
	console.log("Market model initialized with " + market.length + " stocks.\n")
	
	// show initial state of market:
	displayMarket()
	displayPositions()
	
	while (true) {
		//console.log('here')
		await poll(updateMarket)
	}
}

const init = async () => {

	// initialize market model:
	let tmp = await scraper.gainers()
	market = [...tmp.data.stocks]
	sortStocks(market)
	timestamp = tmp.generatedTimestamp

	// initialize positions:
	for (let i = 0; i < NUM_POSITIONS ; i++) {
		positions.push(new Position(market[i]))
	}
}

const evaluatePositions = () => {

	let p, currentPrice, newPrice
	let changeCount = 0
	for (let i = 0; i < positions.length; i++) {
		p = positions[i]
		currentPrice = p.priceHistory.getCurrent()
		newPrice = getStockBySymbol(p.stock.symbol).price
		if (currentPrice != newPrice) {
			p.priceHistory.logUpdate(newPrice)
			let s = (p.stock.symbol + " ")
			s += (newPrice - currentPrice > 0) ? "jumped" : "fell"
			s += (" from " + currentPrice + " to " + newPrice + "...")
			console.log(s)
			p.priceHistory.display()
			changeCount++
		}
	}
	if (changeCount <= 0) {
		console.log("None of your positions have changed in value. Something went wrong.")
		exit()
	}
	else {
		console.log(changeCount + " OF YOUR POSITIONS HAVE CHANGED IN VALUE:")
		console.log("-------------------------------------------")
		displayPositions()
	}
}


/*=========================================
=            POLLING FUNCTIONS            =
=========================================*/

const poll = async (updateMarket) => {

	let cur = await scraper.gainers()
	updateMarket(cur)	
	await new Promise(r => setTimeout(r, 1000));	// sleep
}

const updateMarket = (cur) => {

	lastTimestamp = timestamp
	timestamp = cur.generatedTimestamp

	if (timestamp < lastTimestamp) {
		console.log("BNNBloomberg's API blew it this time...")
		return
	}
	if (marketDiff(sortStocks(cur.data.stocks))) {
		market = cur.data.stocks	

		evaluatePositions()	
		displayMarket()
	}
	else if (lastTimestamp != timestamp) {
		console.log(timestamp.substring(11) + ": Nothing to report...")
	}
}

/*----------  Polling helpers  ----------*/

const marketDiff = (stockArr, n=10) => {

	//stockArr.map((stock, newIndex) => stockDiff(stock, newIndex))

	let oldIndex
	for (let newIndex = 0; newIndex < n; newIndex++) {
		oldIndex = market.findIndex(s  => s.symbol == stockArr[newIndex].symbol); 
		//console.log(oldIndex + " " + newIndex)
		if (newIndex != oldIndex) {			
			return true
			/*process.stdout.write(stock.symbol)
			let a = (newIndex - oldIndex > 0) ? "jumped" : "fell"
			process.stdout.write(a +" from " + oldIndex + " to " + newIndex + "...\n")*/			
		}
	}
	return false
}

/*
const stockDiff	= (stock, newIndex) => {
	//console.log("stockDiff(" +stock.symbol +")")
	let oldIndex = market.findIndex(s  => s.symbol == stock.symbol); 
	//console.log("old index of " + stock.symbol + " is " + oldIndex )
	//console.log("new index of " + stock.symbol + " is " + newIndex + "\n\n")
	if (newIndex != oldIndex) {
		process.stdout.write(stock.symbol)
		let a = (newIndex - oldIndex > 0) ? "jumped" : "fell"
		process.stdout.write(a +" from " + oldIndex + " to " + newIndex + "...\n")
	}	                
}*/

/*=============================	============
=            DISPLAY FUNCTIONS            =
=========================================*/

const displayMarket = (n=10) => {

	//console.log("*********************************************************")
	console.log("New market snapshot at " + timestamp.substring(11) + ": ")

	for (let i = 0; i < n; i++) {
		console.log(market[i].symbol + "  \t" + market[i].price)
	}		
	console.log("\n")
}

const displayPositions = () => {

	//console.log("Positions: ")
	let p, priceDiff
	for (let i = 0; i < positions.length; i++) {
		p = positions[i]
		priceDiff = p.priceHistory.getCurrent() - p.stock.price
		console.log(p.stock.symbol + "  \t@ " + p.priceHistory.getCurrent() + "  \t" + priceDiff.toFixed(2))
	}
	console.log("\n")
}

/*=====================================
=            MISC. HELPERS            =
=====================================*/

const getStockBySymbol = (symbol) => {

	for (let i = 0; i < market.length; i++) {

		if (market[i].symbol == symbol) return market[i]
	}
}

const sortStocks = (stockArr) => {

	stockArr.sort((a, b) => b.pctChng - a.pctChng);
	return stockArr
}

/*===============================
=            Program            =
===============================*/

main()