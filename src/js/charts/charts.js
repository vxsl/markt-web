/* eslint-disable */
var positions = []
var charts = []

var updating = false

const updateEvaluate = async (i) => {
console.log("UPDATE")
	let p = positions[i]
    console.dir(p)
	
	let newQuote = await p.quoter.quote()
	let newTimestamp = Date.parse(newQuote.generatedTimestamp).toString()

	if (newTimestamp > p.price.history[0].timestamp) {
        console.log('inside')
		//tools.refreshLog(i, newTimestamp, p.ticker + ": New update.", " [" + ((Date.now() - newTimestamp) / 1000) + " seconds late]")
		let newPrice = newQuote.data.stocks[0].price		
		let currentPrice = p.price.current

		let s = ''
		
		if (currentPrice != newPrice) {
			p.price.current = newPrice
			p.price.history.unshift({value:newPrice, timestamp: newTimestamp})

			// extra stuff:
			if (newPrice < p.price.min) {
				p.price.min = newPrice
			}
			else if (newPrice > p.price.max) {
				p.price.max = newPrice
			}			
			s += (p.ticker + " ")
			s += (newPrice - currentPrice > 0) ? "jumped" : "fell"
			s += (" from " + currentPrice.toFixed(2) + " to " + newPrice.toFixed(2) + "...\n")	
		}
		
		if (currentPrice > newPrice) buySellEmitter.emit("sell", p.ticker, newPrice)
			
		s? console.log(s) : null
		//writeJSON(modelPositions, "modelPositions.json")
	}
	else {
		/* tools.refreshLog(i, newTimestamp, p.ticker + ": Nothing to report...") */
	}
	p.lock = 0
}

const refreshChart = async (i) => {
    let chart = charts[i]
    console.log('here')            
    if (!updating) {
        updating = true
        /* positions = await fetchPositions() */
    }
    let p = positions[i]
    chart.data.datasets[0].data.push({
        x:Date.now(),
        //y:p.price.current
        y:Date.now()
    })

    chart.data.datasets[0].data = chart.data.datasets[0].data.slice(-10)
    
    // adjust min/max of the chart if necessary
    chart.options.scales.yAxes[0].ticks.min = Math.max(0, 0.995*p.price.min);
    chart.options.scales.yAxes[0].ticks.max = 1.025*p.price.max;      
    
    if (i+1 === positions.length) {
        updating = false
    }
    
    console.log('end')      
}

const createChart = (i=null) => {
    
    if (i == null) {
        let toRemove = document.getElementById('dummy_chart_overlay')
        if (toRemove != null) toRemove.parentNode.parentNode.removeChild(toRemove.parentNode)
    }

    let outerContainer = document.createElement('div')
    outerContainer.classList.add('chart-container-container')

    let innerContainer = document.createElement('div');
    innerContainer.classList.add('chart-container');

    let canvas = document.createElement('canvas');
    let extLabel = document.createElement('div')
    extLabel.classList.add('chart-extlabel');
    let extLabelHeader = document.createElement('h2')

    if (i == null) {
        extLabelHeader.innerHTML = "&nbsp;"    
        extLabel.setAttribute('style', 'opacity:0')
        canvas.setAttribute('id', 'dummy_chart')
    }
    else {        
        extLabelHeader.innerHTML = positions[i].ticker      
    }  
      
    extLabel.appendChild(extLabelHeader)         
    innerContainer.appendChild(extLabel)
    innerContainer.appendChild(canvas);

    if (i == null) {   
        
        let overlay = document.createElement('div')
        overlay.setAttribute('id', 'dummy_chart_overlay')

        let p = document.createElement('p')   
        p.innerHTML = '+'
        overlay.append(p)

        let input = document.createElement('input')
        input.setAttribute("id", "symbol")
        input.setAttribute("type", "text")
        input.setAttribute("name", "symbol")


        
        overlay.append(input)

        overlay.onclick = () => {
            p.setAttribute("style","display:none !important")
            input.setAttribute("style","display:block")
            input.focus()
            input.select()
        } 

        outerContainer.append(overlay)               
    }

    outerContainer.append(innerContainer)

    document.getElementById("positionsTable").appendChild(outerContainer);    
    
    let ctx = canvas.getContext('2d');  

    if (i == null) {
        new Chart(ctx, dummy())
        console.log($("#symbol"))
        $( "#symbol" ).autocomplete({    
            minLength: 0,
            source: knownSymbols.ca.concat(knownSymbols.nasdaq),        
            select: async function( event, ui ) {
                $( "#symbol" ).val( ui.item.label );    
                positions.push(await appLink.createPosition(ui.item.label))
                updateTable()        
                return false;
            }
        })
        .autocomplete( "instance" )._renderItem = function( ul, item ) {
            return $( "<li>" )
            .append( "<div class='input-menu-item'>" + item.label + "<br><div class='input-menu-subheading'>" + item.name + "</div></div>" )
            .appendTo( ul );
        };
    }
    else {
        charts[i] = new Chart(ctx, reg(i))
        //charts[i].options.scales.xAxes[0].realtime.onRefresh = refreshChart(i)
    }
}

const init = async() => {
    for (let i in positions) {
        createChart(i)
    }
    createChart()

    /* positions.push(await appLink.createPosition("AC:CT"))
    updateTable() */
}

const updateTable = () => {
    
    for (let i in positions) {
        createChart(i)
    }
    createChart()
}

init()