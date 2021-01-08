var positionsTable = document.getElementById('positionsData')
positionsTable.setAttribute("border", "1")
positionsTable.setAttribute("cellpadding", "10")

const readData = async () => {    
    
    var xhr = new XMLHttpRequest();    
    xhr.open('GET', 'js/data/positions.json');    
    xhr.send();
    return new Promise((resolve, reject) => {
        xhr.onload = () => resolve(JSON.parse(xhr.responseText))        
        xhr.onerror = reject
    })  

}
/* for (let j=0; j<6; j++){
    var tr = document.createElement('tr');
    positionsTable.appendChild(tr);
    
    for (var k=0; k<5; k++){
        var td = document.createElement('td');
        //td.width='75';
        td.appendChild(document.createTextNode("Cell " +  j));
        tr.appendChild(td);
    }
}  
sidebarContainer.appendChild(positionsTable) */

var initialized = false

let createTable = async() => {

    let positions = await readData()

    let tr = document.createElement('tr')
    positionsTable.appendChild(tr)
    for (let key in positions[0]) {
        let th = document.createElement('th')
        tr.appendChild(th)                 
        if (key == "average") th.innerHTML = "AVG"   
        else if (key == "quantity") th.innerHTML = "QTY"   
        else th.innerHTML = key.toUpperCase()        
    }
    for (let i=0; i<positions.length; i++){
        let tr = document.createElement('tr')
        positionsTable.appendChild(tr);        
        for (let key in positions[i]) {
            var td = document.createElement('td');
            //td.width='75';
            td.appendChild(document.createTextNode(positions[i][key]));
            tr.appendChild(td);
        }
    }  
    tr = document.createElement('tr')
    positionsTable.appendChild(tr)
    for (let key in positions[0]) {
        var td = document.createElement('td');
        td.appendChild(document.createTextNode(''));
        tr.appendChild(td);
    }
    
    initialized = true
}

let tableRefresh = async() => {
    
    if (!initialized) await createTable()

    while (true) {
        let positions = await readData()
        let j
        let netTotal = 0
        for (let i=1; i<=positions.length; i++){
            let tr = positionsTable.rows[i]
            if (positions[i-1].sold) tr.style.fontWeight = "bold"
            j = 0
            for (let key in positions[i-1]) {
                if (key == "net") break  
                tr.cells[j++].innerHTML = positions[i-1][key]                
            }
            let net = positions[i-1]["net"]            
            netTotal += parseFloat(net)
            let td = tr.cells[j++]
            if (net > 0) {
                net = "+" + net
                td.style.color = 'green'
            }
            else if (net < 0) {
                td.style.color = "red"
            }
            else net = null
            td.innerHTML = net
        }
        let tr = positionsTable.rows[positions.length+1]
        let td = tr.cells[--j]
        if (netTotal > 0) {
            netTotal = "+" + netTotal.toFixed(2)
            td.style.color = 'green'
        }
        else if (netTotal < 0) {
            netTotal = netTotal.toFixed(2)
            td.style.color = "red"
        }
        else netTotal = 0
        td.innerHTML = "<b>" + netTotal + "</b>"
        
        await new Promise(r=> setTimeout(r,500))
    }
}

tableRefresh()