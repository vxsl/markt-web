const scraper = require("./bnnbloomberg-markets-scraper")
const { PriceHistory } = require("./PriceHistory.js")

var market = []
var timestamp, lastTimestamp
var alternate = false

const TESTS = 1000

const main = async () => {
	
	let failCount = 0
	
	scraper.select(0)

	for (let i = 0; i < TESTS; i++) {
		let result = await scraper.poll()
		if (result == 'fail') {
			//console.log("fail...")
			failCount++
		}
	}

	console.log(failCount + " fails")
	console.log(TESTS - failCount + "successes")
}
main()