const   // nthline = require('node-nthline'),
		child_process = require('child_process'),
        fs = require('fs'),
		config = require('../../config.js')
		
process.chdir(config.workDir)

const threeDigitMillis = (timeString) => {
	millis = timeString.getMilliseconds().toString()
	for (let i = 0; i < (3 - millis.length); i++) {
		millis += "0"
	}
	return millis
}

const replaceNthLine = (n, message) => {
	let filename = config.fileDir + "refreshLog"		
	child_process.execSync(`sed -i ` + (n+1) + `'s/.*/` + message + `/' ` + filename)
	// TODO use something other than a system tool...
	// if we are going to use sed, at least make it so the nth line doesn't have to exist in order to write the line
}

const epochToTimeString = (epochString) => {
	let d = new Date(parseInt(epochString))
	let m = threeDigitMillis(d)
	return d.toLocaleTimeString().replace(" PM", ":" + m +" PM").replace(" AM", ":" + m +" AM")
}

// special fn to avoid writing "Nothing to report..." over and over again
const refreshLog = async (index, timestamp, message, extra="") => {

	let formattedMessage = epochToTimeString(timestamp) +" => "+message+extra
	replaceNthLine(index, formattedMessage)
	
	if (config.debug) console.log(epochToTimeString(timestamp)+" => "+message+extra)
	return	
}

module.exports = {
    refreshLog
}