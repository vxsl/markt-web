const   config = require("../config.js"),
        fs = require('fs'),
    	child_process = require('child_process')

const epochToTimeString = (epochString) => {
	let d = new Date(epochString)
	let m = threeDigitMillis(d)
	return d.toLocaleTimeString().replace(" PM", ":" + m +" PM").replace(" AM", ":" + m +" AM")
}

const threeDigitMillis = (timeString) => {
	millis = timeString.getMilliseconds().toString()
	for (let i = 0; i < (3 - millis.length); i++) {
		millis += "0"
	}
	return millis
}

const writeJSON = async (data, filename) => {
	fs.writeFile(config.fileDir+filename, JSON.stringify(data), (err) => {
		if (err != null) {
			log(err)
		}
	})
}

const log = (message) => {
	
	fs.appendFileSync(config.fileDir+'log', message+"\n")
	if (config.debug) console.log(message) 
}

// special fn to avoid writing "Nothing to report..." over and over again
const refreshLog = async (timestamp, message, extra="") => {

	let filename = config.fileDir+'log'	
	fs.openSync(filename, 'r+')

	// remove redundant line from end of log
	let stdout = child_process.execSync('tail -n 1 '+filename)
	let stat = fs.statSync(filename)
	
	if (stdout.includes(message)) {
		fs.truncateSync(filename, stat.size - stdout.length)
	}
	
	// replace with new line
	let formattedTime = epochToTimeString(timestamp)
	fs.appendFileSync(filename, formattedTime+" => "+message+extra+"\n")
	if (config.debug) console.log(formattedTime+" => "+message+extra)	
}

module.exports = {
    epochToTimeString,
    writeJSON,
    log,
    refreshLog
}