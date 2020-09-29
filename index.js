const scraper = require("./bnnbloomberg-markets-scraper")

const main = async () => {
	var data = await scraper.gainers()	
	console.log(data)
}

main()
