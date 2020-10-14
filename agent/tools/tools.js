const readline = require("readline")

// TODO add other cases for US stocks, etc. Determine what possible suffixes there are in the WS catalogue -- is it just :TSX and :NYSE? What are the corresponding 
const formatTicker = (unformatted) => {
    let substrings = unformatted.split(":")
    if (substrings.length != 2) throw "Something went wrong. " + unformatted + "is not a valid ticker..."
    switch (substrings[1]) {
        case "CT":
            return substrings[0] + ":TSX"
    }
}

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


// Find a non-TFSA, non-crypto account
const chooseAccount = async (accountSet, auto) => {
    
    let result = null
    for (let i = 0; i < accountSet.results.length; i++) {
        if (accountSet.results[i].id.includes('tfsa') || accountSet.results[i].id.includes('crypto')) continue
        else {
            result = accountSet.results[i]
            break
        }
    }
    if (result !== null && !auto) {
        while (true) {
            let userResponse = await userPrompt("Selecting " + result.id + " (balance " + result.current_balance.amount + ", created " + result.created_at + "). \nOK?: [y/n] ");
            if (userResponse === 'y' || userResponse === 'Y') {
                return result
            }
            else if (userResponse === 'n' || userResponse === 'N') {
                return 0
            }
        }
    }
    else if (auto) return result   
    else return 1
}

// TODO delete?
/* const displayActualPositions = () => {
    // display individual info
	for (let i = 0; i < fakePositions.length; i++) {
		console.log(fakePositions[i].quote.amount);
		console.log(fakePositions[i].quote.security_id);
		console.log(fakePositions[i].stock.symbol);
		console.log("******************")
		//console.log(currentTotal);
	}
} */

module.exports = {
    userPrompt,
    chooseAccount,
    formatTicker
}