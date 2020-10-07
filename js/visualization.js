const NUM_TABLES = 6

var positions
var update = true


var charts = []

const MAINCOLOR = 'rgb(5, 205, 255)'
const SECONDARYCOLOR = 'rgb(236, 236, 236)'

const fetchPositions = async () => {    
    
    var xhr = new XMLHttpRequest();    
    xhr.open('GET', 'js/positions.json');    
    xhr.send();
    return new Promise((resolve, reject) => {
        xhr.onload = () => resolve(JSON.parse(xhr.responseText))        
        xhr.onerror = reject
    })    
}

const init = async () => {

    let data = await fetchPositions()

    for (let i = 0; i < NUM_TABLES; i++) {

        let container = document.querySelector('.chartTable-sidebar')
        let sidebarTable = document.createElement('table')
        sidebarTable.setAttribute("border", "1")
        sidebarTable.setAttribute("cellpadding", "10")
        for (let j=0; j<3; j++){
            var tr = document.createElement('tr');
            sidebarTable.appendChild(tr);
            
            for (var k=0; k<4; k++){
                var td = document.createElement('td');
                //td.width='75';
                td.appendChild(document.createTextNode("Cell " + i + "," + j));
                tr.appendChild(td);
            }
         }  
        container.appendChild(sidebarTable)

         
        container = document.querySelector('.chartTable');
        let outerCountainer = document.createElement('div')
        outerCountainer.classList.add('chart-container-container')

        let innerContainer = document.createElement('div');
        innerContainer.classList.add('chart-container');

        let canvas = document.createElement('canvas');
        let extLabel = document.createElement('div')
        extLabel.classList.add('chart-extlabel');
        let extLabelHeader = document.createElement('h2')
        extLabelHeader.innerHTML = data[i].stock.symbol
        extLabel.appendChild(extLabelHeader)
        

        innerContainer.appendChild(extLabel)
        innerContainer.appendChild(canvas);
        outerCountainer.append(innerContainer)
        container.appendChild(outerCountainer);        

        let ctx = canvas.getContext('2d');
        //var config = createConfig(details.mode, details.intersect);
        charts[i] = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    fill:false,
                    label: data[i].stock.symbol,
                    backgroundColor: MAINCOLOR,
                    borderColor: MAINCOLOR,
                    data: data[i].price.history
                }]
            },
            plugins: [{
                /* Adjust label font size according to chart size */
                beforeDraw: function(c) {
                    c.options.legend.labels.fontSize = c.chart.height * 0.07;
                }
            }],            
            options: {
                //responsive:true,
                elements: {
                    point: {
                        radius:0
                    }
                },
                aspectRatio:1,
                maintainAspectRatio:true,
                legend: {
                    display:false,
                    position:'top',
                    align:'start',
                    onClick:null,
                    labels: {
                        fontColor: MAINCOLOR,
                        //fontStyle:'bold',
                        fontFamily:'Helvetica',
                        boxWidth:0,
                    }
                },
                scales: {
                    xAxes: [{                    
                        color:SECONDARYCOLOR,    
                        gridLines: {
                            color:SECONDARYCOLOR
                        },
                        type: 'realtime',
                        realtime: {
                            onRefresh: async function(chart) {
                                let position = await fetchPositions().then(function(json) {
                                    return json[i]    // TODO stop this from executing fetchPositions() 6 times....
                                })
                                chart.data.datasets.forEach(async function(dataset) {                                    
                                    dataset.data.push({
                                        x: Date.now(),
                                        //y: charts[i].data.datasets[0].data[0]
                                        //y: dataset.data[0]
                                        y: position.price.current
                                    });                                    
                                    //console.log(dataset.data[0])
                                });
                                chart.options.scales.yAxes[0].ticks.max = 1.3*position.price.max;
                            },
                            delay:2000
                        }                
                      }],
                    yAxes: [{
                        color:SECONDARYCOLOR,
                        gridLines: {
                            color:SECONDARYCOLOR
                        },
                        ticks: {
                            suggestedMin: 0,
                            maxTicksLimit: 4
                        }
                    }]
                }
            }
        }); 
    };
}

init()