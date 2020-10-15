const { QuoteHarvester } = require("./bnnbloomberg-markets-scraper/QuoteHarvester")

class ModelPosition {
    constructor (quoteHarvester, price) {
        this.ticker = quoteHarvester.ticker
        this.quoter = quoteHarvester
        this.price = price
        this.lock = 0
    }
	
	static async build (ticker, price) {
		try {
			return new ModelPosition(await QuoteHarvester.build(ticker), price)
		}
		catch (error) {
			console.log(error)
			throw "...unable to instantiate a ModelPosition object for " + ticker + ".\n"
		}		
	}

    async newQuote () {
        return await this.quoter.quote()
    }
}

module.exports = {
    ModelPosition
}