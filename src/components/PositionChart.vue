<script>
import { Line } from 'vue-chartjs'
import '@taeuk-gang/chartjs-plugin-streaming';

const MAINCOLOR = 'rgb(61,61,61)'
const SECONDARYCOLOR = MAINCOLOR

export default {
  name: 'PositionChart',
  extends: Line,
  mounted () {
    this.renderChart(
      // data:
      {
            datasets: [{
                fill:false,
                label: 'test',
                backgroundColor: MAINCOLOR,
                borderColor: MAINCOLOR,
                lineTension:0,
                data: []
            }]
        },    
        // options:  
        {
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
                    ticks: {
                        display:false
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
    );
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
