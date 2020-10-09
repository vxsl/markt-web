const readLog = async () => {    
    
    var xhr = new XMLHttpRequest();    
    xhr.open('GET', 'js/data/log');    
    xhr.send();
    return new Promise((resolve, reject) => {
        xhr.onload = () => resolve(xhr.responseText.split("\n").slice(-15).join("\n"))        
        xhr.onerror = reject
    })    
}

const log = document.getElementById("log")

const main = async () => {
    let d, millis, n
    let clock = document.getElementById("clock")
    while (true) {
        //update log
        log.innerHTML = await readLog()

        // update clock
        d = new Date()
        millis = d.getMilliseconds().toString()
        n = 3 - millis.length
        for (let i = 0; i < n; i++) {
            millis += "0"
        }
        if (millis.length < 3) {
            console.log(millis)
        }
        clock.innerHTML = "<b>"+d.toLocaleTimeString().replace(" AM", ":"+millis+" AM").replace(" PM", ":"+millis +" PM")+"</b>"
        await new Promise(r => setTimeout(r, 10));
    }
}

main()