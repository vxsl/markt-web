const   config = require("../config.js"),
        fs = require('fs'),
		child_process = require('child_process'),
		readline = require('readline')
		
process.chdir(config.workDir)

const userPrompt = (message) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(message, ans => {
        rl.close();
        resolve(ans);
    }))
}

const safePrompt = async () => {
	while (true) {
		let userResponse = await userPrompt("Safe-ish mode? [y/n] ");
		if (userResponse === 'y' || userResponse === 'Y') {
			return true
		}
		else if (userResponse === 'n' || userResponse === 'N') {
			return false
		}
	}
}

/**
 * delays execution of function fn until time "XX:XX". 
 * If async, return a promise.
 */
const delayFunctionCall = (fn, time, async=false) => {

    let now = new Date();
    let then = new Date(now.getFullYear(), now.getMonth(), now.getDate(), time.split(":")[0], time.split(":")[1], 0, 0)
    let msUntil = then - now;
    
    console.log("\nIt is " + now.toLocaleTimeString() + ". Waiting until " + then.toLocaleTimeString() + " to execute " + fn.name + ".")

    if (!async) {        
        setTimeout(fn, 1);
    }
    else {
        return new Promise(function(resolve, reject) {
            setTimeout(() => {
                resolve(async () => {
                    return await fn()
                })
            }, msUntil);
        });
    }
}

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
	refreshLog,
	delayFunctionCall,
	safePrompt
}