const { QuoteHarvester } = require("./bnnbloomberg-markets-scraper/QuoteHarvester")

class Position {
    constructor (quoteHarvester, data) {
        this.ticker = quoteHarvester.ticker
        this.quoteHarvester = quoteHarvester
        this.data = data
    }
	
	static async build (data) {
		try {
			return new Position(await QuoteHarvester.build(data.ticker), data)
		}
		catch (error) {
			console.log(error)
			throw "...unable to instantiate a Position object for " + ticker + ".\n"
		}		
	}

    async newQuote () {
        return await this.quoteHarvester.quote()
    }
}

module.exports = {
    Position
}