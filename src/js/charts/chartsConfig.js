/* eslint-disable */

const MAINCOLOR = 'rgb(61,61,61)'
const SECONDARYCOLOR = MAINCOLOR

const dummy = () => {
    return {
        type: 'line',
        data: {
            datasets: [{
                fill:false,
                label: 'test',
                backgroundColor: MAINCOLOR,
                borderColor: MAINCOLOR,
                lineTension:0,
                data: []
            }]
        },      
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
                    gridLines: {
                        color:SECONDARYCOLOR
                    },
                    type: 'realtime'               
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
    }
}

const reg = (i) => {
    return {
        type: 'line',
        data: {
            datasets: [{
                fill:false,
                label: positions[i].ticker,
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
                            console.log('start')                                
                            if (!updating) {
                                charts[i].updating = true
                                await updateEvaluate(i)
                                //positions = await fetchPositions()
                            } 
                           
                            //Array.prototype.push.apply(chart.data.datasets[0].data, position[i].price.current);

                            let p = positions[0]
                            //console.log(p.price)
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
                            
                            charts[i].updating = false
                            console.log('end')       
                        },
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
    }
}
