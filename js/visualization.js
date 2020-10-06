const NUM_TABLES = 6

var positions
var update = true

var container = document.querySelector('.chartTable');

var charts = []

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
        var div = document.createElement('div');
        div.classList.add('chart-container');

        var canvas = document.createElement('canvas');
        div.appendChild(canvas);
        container.appendChild(div);        

        var ctx = canvas.getContext('2d');
        //var config = createConfig(details.mode, details.intersect);
        charts[i] = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    fill:false,
                    label: data[i].stock.symbol,
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgb(255, 99, 132)',
                    data: data[i].price.history
                }]
            },            
            options: {
                scales: {
                    xAxes: [{
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
                            }
                        }                
                      }],
                    yAxes: [{
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