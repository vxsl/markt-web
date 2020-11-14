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

const reg = (label) => {
    return {
        type: 'line',
        data: {
            datasets: [{
                fill:false,
                label: label,
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
