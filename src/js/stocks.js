const	{ EventEmitter } = require("events"),
        { QuoteHarvester } = require("./bnnbloomberg-markets-api/QuoteHarvester")

class Stock {
	constructor (quoteHarvester, price) {
		this.ticker = quoteHarvester.ticker
		this.quoter = quoteHarvester
		this.price = price
		this.lock = 0
	}
	
	static async build (ticker) {
        let p = await QuoteHarvester.build(ticker)
        let q = await p.quote()
        console.dir(q)
        let initPrice = q.data.stocks[0].price
        let price = {
            current:initPrice,
            history:[{value: initPrice, timestamp: Date.parse(q.generatedTimestamp).toString()}],				
            min:initPrice,
            max: initPrice,
            average:initPrice  
        }   
        return new Stock(p, price)
	}

	async newQuote () {
		return await this.quoter.quote()
	}
}

const initializeStock = async (ticker) => {

	let result = await Stock.build(ticker)
	return result
}

module.exports = {
	initializeStock,
}