var positions
var update = true


var charts = []

const MAINCOLOR = 'rgb(5, 205, 255)'
const SECONDARYCOLOR = 'rgb(236, 236, 236)'

var updating = false

const fetchPositions = async () => {
    let xhr, r    
    while (true) {
        xhr = new XMLHttpRequest();    
        xhr.open('GET', 'js/data/stocks.json');    
        xhr.send();
        return new Promise((resolve, reject) => {
            xhr.onload = () => resolve(JSON.parse(xhr.responseText))        
            xhr.onerror = reject
        })     
        /* r = await new Promise(async (resolve, reject) => {    
            xhr.onload = async () => {
                try {resolve(JSON.parse(xhr.responseText))}
                catch (error) {return 1}
            }             
            xhr.onerror = reject
        }) 
        if (r != 1) return r */   
    }
}

const init = async () => {

    positions = await fetchPositions()  // first call
    console.log(positions)

    for (let i = 0; i < positions.length; i++) {      

        let container = document.querySelector('.chartTable');
        let outerCountainer = document.createElement('div')
        outerCountainer.classList.add('chart-container-container')

        let innerContainer = document.createElement('div');
        innerContainer.classList.add('chart-container');

        let canvas = document.createElement('canvas');
        let extLabel = document.createElement('div')
        extLabel.classList.add('chart-extlabel');
        let extLabelHeader = document.createElement('h2')
        extLabelHeader.innerHTML = positions[i].stock.symbol
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
                    label: positions[i].stock.symbol,
                    backgroundColor: MAINCOLOR,
                    borderColor: MAINCOLOR,
                    lineTension:0,
                    data: []
                }]
            },
            plugins: [{
                /* Adjust label font size according to chart size */
                beforeDraw: function(c) {
                    c.options.legend.labels.fontSize = c.chart.height * 0.07;
                },
                //streaming: 30
            }],            
            options: {
                //responsive:true, 
                events: [],        
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
                    },
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
                                
                                if (!updating) {
                                    updating = true
                                    positions = await fetchPositions()
                                }
                                //Array.prototype.push.apply(chart.data.datasets[0].data, position[i].price.current);

                                let p = positions[i]
                                chart.data.datasets[0].data.push({
                                    //x:position[i].price.history[0].timestamp,
                                    x:Date.now(),
                                    y:p.price.current
                                })

                                chart.data.datasets[0].data = chart.data.datasets[0].data.slice(-10)
                                
                                //console.log(i + ": " + position[i].price.current)
                                //console.log(chart.data.datasets[0].data)
                                //chart.update()

                                // adjust min/max of the chart if necessary
                                chart.options.scales.yAxes[0].ticks.min = Math.max(0, 0.995*p.price.min);
                                chart.options.scales.yAxes[0].ticks.max = 1.025*p.price.max;      
                                
                                if (i+1 === positions.length) {
                                    updating = false
                                }
                            },
                            /*onRefresh: async function(chart) {
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
                            },*/
                            //delay:2000
                        }                
                      }],
                    yAxes: [{
                        color:SECONDARYCOLOR,
                        gridLines: {
                            color:SECONDARYCOLOR
                        },
                        ticks: {
                            //suggestedMin: 0,
                            maxTicksLimit: 4
                        }
                    }]
                }
            }
        }); 
    };
}

init()