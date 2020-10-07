const scraper = require("./bnnbloomberg-markets-scraper")
const fs = require('fs')

const NUM_POSITIONS = 6
const date = new Date()


const stdoutLog = false

var positions = []
var market = []
var currentTimestamp, lastTimestamp

process.chdir('/var/www/html/kylegrimsrudma.nz/scalping-agent/')
const jsonDir = '../public_html/tsx-project/scalping-agent-web/js'

const main = async () => {
	
	log("\nInitializing...")
	await init()	
	log("Market model initialized with " + market.length + " stocks.\n")
	
	// show initial state of market:
	displayMarket()
	displayPositions()
	
	while (true) {
		updateMarket(await getNewQuote())
	}
}

const init = async () => {
	
	// initialize bnnbloomberg-markets-scraper
	await scraper.initialize(0)

	// initialize market model:
	let tmp = await getNewQuote()
	market = [...tmp.data.stocks]
	sortStocks(market, 'pctChng')
	currentTimestamp = Date.parse(tmp.generatedTimestamp)

	// initialize positions:
	for (let i = 0; i < NUM_POSITIONS ; i++) {
		positions.push({
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
}

const evaluatePositions = () => {

	let p, currentPrice, newPrice
	let changeCount = 0
	for (let i = 0; i < positions.length; i++) {
		p = positions[i]
		currentPrice = p.price.current
		newPrice = getStockBySymbol(p.stock.symbol).price
		
		if (currentPrice != newPrice) {
			p.price.current = newPrice
			p.price.history.unshift({value:newPrice, timestamp: currentTimestamp})
			if (newPrice < p.price.min) {
				p.price.min = newPrice
			}
			else if (newPrice > p.price.max) {
				p.price.max = newPrice
			}
			//p.history.push(newPrice)
			let s = (p.stock.symbol + " ")
			s += (newPrice - currentPrice > 0) ? "jumped" : "fell"
			s += (" from " + currentPrice + " to " + newPrice + "...")
			//log(s + p.price.history)
			changeCount++
		}
	}
	/*if (changeCount <= 0) {
		log("None of your positions have changed in value. Something went wrong.")
		//exit()
	}
	else {*/
	if (changeCount > 0) {
		log(changeCount + " OF YOUR POSITIONS HAVE CHANGED IN VALUE:")
		log("-------------------------------------------")
		displayPositions()
	}

	writeJSON(positions)
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
		
		log(currentTimestamp + ": Nothing to report...")
	}

	evaluatePositions()	
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

const marketDiff = (stockArr, n=NUM_POSITIONS*2) => {

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

	log("New market snapshot at " + currentTimestamp + ": ")

	/*for (let i = 0; i < n; i++) {
		log(market[i].symbol + "  \t" + market[i].price.toFixed(2) + "\t\t+" + market[i].pctChng.toFixed(2) + "%")
	}
	log("\n")*/
}

const displayPositions = async () => {

	//log("Positions: ")
	let p, priceDiff
	for (let i = 0; i < positions.length; i++) {
		p = positions[i]
		priceDiff = p.price.history[0].value - p.price.average
		log(p.stock.symbol + "  \t@ " + p.price.history[0].value.toFixed(2) + "  \t" + priceDiff.toFixed(2))
	}
	log("\n")
}

/*=====================================
=            MISC. HELPERS            =
=====================================*/

const writeJSON = async (data) => {
	fs.writeFile(jsonDir+'/positions.json', JSON.stringify(data), (err) => {
		//log("wrote positions to JSON")
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

const log = async(message) => {
	
	fs.appendFile(jsonDir+'/information/log', message+"\n", function (err) {
		if (err) throw err;
	});
	if (stdoutLog) console.log(message + "\n")
}

/*===============================
=            Program            =
===============================*/

main()
