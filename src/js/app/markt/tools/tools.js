const   config = require("../config.js"),
        fs = require('fs'),
        readline = require('readline'),
        { EventEmitter } = require("events")

const logEmitter = new EventEmitter()
//process.chdir(config.workDir)

/* const userPrompt = (message) => {
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
} */

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


const writeJSON = async (data, filename) => {
	fs.writeFile(config.fileDir+filename, JSON.stringify(data), (err) => {
		if (err != null) {
			log(err)
		}
	})
}

const log = (message) => {
	
    //fs.appendFileSync(config.fileDir+'log', message+"\n")
    logEmitter.emit('new', message)
	if (config.debug) console.log(message)
}


module.exports = {
    writeJSON,
    log,
    delayFunctionCall,
    logEmitter
	//safePrompt
}