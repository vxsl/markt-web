const scraper = require("./bnnbloomberg-markets-scraper")


var market = []
var timestamp

const getStockBySymbol = (symbol) => {

	for (var i = 0; i < market.length; i++) {

		if (market[i].symbol = symbol) return market[i]
	}
}

const display = () => {

	for (var i = 0; i < 10; i++) {
		console.log(market[i].symbol)
	}		
	//console.log(timestamp)
}

const init = async () => {

	var tmp = await scraper.gainers()
	market = [...tmp.data.stocks]
	sortStocks(market)
	timestamp = tmp.generatedTimestamp
}

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

const sortStocks = (stockArr) => {

	stockArr.sort((a, b) => b.pctChng - a.pctChng);
	return stockArr
}

const updateMarket = (cur) => {

	timestamp = cur.generatedTimestamp
	if (marketDiff(sortStocks(cur.data.stocks))) {
		market = cur.data.stocks
		console.log("*********************************************************")
		console.log("Market updated at " + timestamp.substring(11) + ": ")
		display()
	}
}

const poll = async (updateMarket) => {

	cur = await scraper.gainers()
	updateMarket(cur)		
	await new Promise(r => setTimeout(r, 1000));	// sleep
}


const main = async () => {
	
	console.log("Initializing...")
	await init()	
	console.log("Market model initialized with " + market.length + " stocks.\n")
	
	while (true) {
		//console.log('here')
		await poll(updateMarket)
	}
}

main()
