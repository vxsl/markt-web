const { QuoteHarvester } = require("./bnnbloomberg-markets-scraper/QuoteHarvester")

class Position {
    constructor (quoteHarvester, price) {
        this.ticker = quoteHarvester.ticker
        this.quoter = quoteHarvester
        this.price = price
        this.lock = 0
    }
	
	static async build (ticker) {
		try {
            let p = await QuoteHarvester.build(ticker)
            let price = {
                current:p.price,
                history:[{value: p.price, timestamp: Date.parse(p.generatedTimestamp).toString()}],				
                min:p.price,
                max: p.price,
                average:p.price  
            }
			return new Position(p, price)
		}
		catch (error) {
			console.log(error)
			throw "...unable to instantiate a Position object for " + ticker + ".\n"
		}		
	}

    async newQuote () {
        return await this.quoter.quote()
    }
}

module.exports = {
    Position
}