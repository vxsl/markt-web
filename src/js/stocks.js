const	{ EventEmitter } = require("events"),
        { QuoteHarvester } = require("./bnnbloomberg-markets-api/QuoteHarvester")

const generateStockList = async(pathToWrite=null) => {
	let q = await QuoteHarvester.build('ca')
	let ca = (await q.quote()).data.stocks
	q = await QuoteHarvester.build('us')
	let us = (await q.quote()).data.stocks
	
	if (pathToWrite) {
		var fs = require('fs')
		fs.writeFile(pathToWrite, ca.concat(us), (err) => {
			if (err) {
				console.log(err)
			}
		})
	}
	return ca.concat(us)
}

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
	generateStockList
}