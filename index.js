const scraper = require("./bnnbloomberg-markets-scraper")

var cur
var prev

var market = []
var timestamp

const getStockBySymbol = (symbol) => {

	for (var i = 0; i < market.length; i++) {

		if (market[i].symbol = symbol) return market[i]
	}
}

const display = () => {

	for (var i = 0; i < 10; i++) {
		console.log(market[i])
	}		
	console.log(timestamp)
}

const init = async () => {

	cur = await scraper.gainers()
	market = [...cur.data.stocks]
	market.sort((a, b) => b.pctChng - a.pctChng)
	timestamp = cur.generatedTimestamp
	
	display()
}

const sortCur = () => {

	cur.data.stocks.sort((a, b) => b.pctChng - a.pctChng);
}

const poll = async () => {

	cur = await scraper.gainers()	// allows error-free first iteration
	cur.data.stocks.sort((a, b) => b.pctChng - a.pctChng);

	while(true) {
		prev = cur
		cur = await scraper.gainers()
		//cur.data.stocks.sort((a, b) => b.pctChng - a.pctChng);		
		await new Promise(r => setTimeout(r, 1000));	// sleep
	}	
}


const main = async () => {
	
	init()
}

main()
