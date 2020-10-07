const readLog = async () => {    
    
    var xhr = new XMLHttpRequest();    
    xhr.open('GET', 'js/information/log');    
    xhr.send();
    return new Promise((resolve, reject) => {
        xhr.onload = () => resolve(xhr.responseText.split("\n").slice(-35).join("\n"))        
        xhr.onerror = reject
    })    
}

const log = document.getElementById("log")

const main = async () => {
    while (true) {
        log.innerHTML = await readLog()
    }
}

main()