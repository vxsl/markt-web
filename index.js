const scraper = require("./bnnbloomberg-markets-scraper")
const fs = require('fs')

const NUM_POSITIONS = 4

var positions = []
var market = []
var currentTimestamp, lastTimestamp

process.chdir('/var/www/html/kylegrimsrudma.nz/scalping-agent/')

const main = async () => {
	
	console.log("\nInitializing...")
	await init()	
	console.log("Market model initialized with " + market.length + " stocks.\n")
	
	// show initial state of market:
	displayMarket()
	displayPositions()
	
	while (true) {
		//console.log('here')		
		updateMarket(await getNewQuote())
	}
}

const init = async () => {

	// initialize bnnbloomberg-markets-scraper
	scraper.initialize(0)

	// initialize market model:
	let tmp = await getNewQuote()
	market = [...tmp.data.stocks]
	sortStocks(market, 'pctChng')
	currentTimestamp = tmp.generatedTimestamp

	// initialize positions:
	for (let i = 0; i < NUM_POSITIONS ; i++) {
		positions.push({
			stock:market[i],
			purchasePrice:market[i].price,
			history: [market[i].price]
		})
	}
}

const evaluatePositions = () => {

	let p, currentPrice, newPrice
	let changeCount = 0
	for (let i = 0; i < positions.length; i++) {
		p = positions[i]
		currentPrice = p.history[0]
		newPrice = getStockBySymbol(p.stock.symbol).price
		if (currentPrice != newPrice) {
			p.history.push(newPrice)
			let s = (p.stock.symbol + " ")
			s += (newPrice - currentPrice > 0) ? "jumped" : "fell"
			s += (" from " + currentPrice + " to " + newPrice + "...")
			console.log(s + p.history)
			changeCount++
		}
	}
	if (changeCount <= 0) {
		console.log("None of your positions have changed in value. Something went wrong.")
		//exit()
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

const getNewQuote = async () => {

	let newQuote = await scraper.poll()
	while (true) {
		if (newQuote != 1) break
		newQuote = await scraper.poll()
	}
	return newQuote
}

const updateMarket = (cur) => {

	lastTimestamp = currentTimestamp
	currentTimestamp = cur.generatedTimestamp

	if (currentTimestamp < lastTimestamp) {
		console.log("BNNBloomberg's API blew it this time...")
		return
	}
	if (marketDiff(sortStocks(cur.data.stocks, 'pctChng'))) {
		market = cur.data.stocks	

		evaluatePositions()	
		displayMarket()
	}
	else if (lastTimestamp != currentTimestamp) {
		console.log(currentTimestamp.substring(11) + ": Nothing to report...")
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

const displayMarket = async (n=10) => {

	/*fs.writeFile('../public_html/tsx-project/scalping-agent-web/js/market.json', JSON.stringify(market), () => {
		console.log("wrote market to JSON")
	})*/
	//console.log("*********************************************************")
	console.log("New market snapshot at " + currentTimestamp.substring(11) + ": ")

	for (let i = 0; i < n; i++) {
		console.log(market[i].symbol + "  \t" + market[i].price.toFixed(2) + "\t\t+" + market[i].pctChng.toFixed(2) + "%")
	}	
	
	
	console.log("\n")
}

const displayPositions = async () => {

	fs.writeFile('../public_html/tsx-project/scalping-agent-web/js/positions.json', JSON.stringify(positions), (err) => {
		console.log("wrote positions to JSON")
		if (err != null) {
			console.log(err)
		}
	})

	//console.log("Positions: ")
	let p, priceDiff
	for (let i = 0; i < positions.length; i++) {
		p = positions[i]
		priceDiff = p.history[0] - p.purchasePrice
		console.log(p.stock.symbol + "  \t@ " + p.history[0].toFixed(2) + "  \t" + priceDiff.toFixed(2))
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

main()
