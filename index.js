const scraper = require("./bnnbloomberg-markets-scraper")

const NUM_POSITIONS = 4

var positions = []
let market = []
var timestamp

const main = async () => {
	
	console.log("\nInitializing...")
	await init()	
	console.log("Market model initialized with " + market.length + " stocks.\n")
	displayPositions()
	
	while (true) {
		//console.log('here')
		await poll(updateMarket)
	}
}

const init = async () => {

	// initialize market model:
	var tmp = await scraper.gainers()
	market = [...tmp.data.stocks]
	sortStocks(market)
	timestamp = tmp.generatedTimestamp

	// initialize positions:
	for (var i = 0; i < NUM_POSITIONS ; i++) {
		positions.push(market[i])
	}
}


/*=========================================
=            POLLING FUNCTIONS            =
=========================================*/

const poll = async (updateMarket) => {

	var cur = await scraper.gainers()
	updateMarket(cur)	
	await new Promise(r => setTimeout(r, 1000));	// sleep
}

const updateMarket = (cur) => {

	timestamp = cur.generatedTimestamp
	if (marketDiff(sortStocks(cur.data.stocks))) {

		// evaluatePositions()

		market = cur.data.stocks
		console.log("*********************************************************")
		console.log("Market updated at " + timestamp.substring(11) + ": ")
		displayMarket()
	}
}

/*----------  Polling helpers  ----------*/

const marketDiff = (stockArr) => {

	//stockArr.map((stock, newIndex) => stockDiff(stock, newIndex))

	var oldIndex
	for (var newIndex = 0; newIndex < stockArr.length; newIndex++) {

		oldIndex = market.findIndex(s  => s.symbol == stockArr[newIndex].symbol); 
		if (newIndex != oldIndex) {
			
			return true
			/*process.stdout.write(stock.symbol)
			var a = (newIndex - oldIndex > 0) ? "jumped" : "fell"
			process.stdout.write(a +" from " + oldIndex + " to " + newIndex + "...\n")*/			
		}
	}
	return false
}

/*
const stockDiff	= (stock, newIndex) => {
	//console.log("stockDiff(" +stock.symbol +")")
	var oldIndex = market.findIndex(s  => s.symbol == stock.symbol); 
	//console.log("old index of " + stock.symbol + " is " + oldIndex )
	//console.log("new index of " + stock.symbol + " is " + newIndex + "\n\n")
	if (newIndex != oldIndex) {
		process.stdout.write(stock.symbol)
		var a = (newIndex - oldIndex > 0) ? "jumped" : "fell"
		process.stdout.write(a +" from " + oldIndex + " to " + newIndex + "...\n")
	}	                
}*/

/*=============================	============
=            DISPLAY FUNCTIONS            =
=========================================*/

const displayMarket = (n=10) => {

	for (var i = 0; i < n; i++) {
		console.log(market[i].symbol)
	}		
	//console.log(timestamp)
}

const displayPositions = () => {

	console.log("Positions: ")
	for (var i = 0; i < positions.length; i++) {
		console.log(positions[i].symbol + "  \t@ $" + positions[i].price)
	}
}

/*=====================================
=            MISC. HELPERS            =
=====================================*/

const getStockBySymbol = (symbol) => {

	for (var i = 0; i < market.length; i++) {

		if (market[i].symbol = symbol) return market[i]
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