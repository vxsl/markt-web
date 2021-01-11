<script>
import { Line } from 'vue-chartjs'
import '@taeuk-gang/chartjs-plugin-streaming';
const { log } = require('@/js/log.js')

export default {
  data() {
    return {
    }
  },
  name: 'StockChart',
  extends: Line,
  props: {
    bought: Boolean,
    insane: Boolean,
    stock: {

    },
    plugins: [{
        /* Adjust label font size according to chart size */
            beforeDraw: function(c) {
              c.options.legend.labels.fontSize = c.chart.height * 0.07;
            },
            //streaming: 30
        }],
  },
  methods: {
    async updateEvaluate() {
      let p = this.stock
      
      let newQuote = await p.quoter.quote()
      if (this.insane) {
        newQuote.data.stocks[0].price += Math.random()
      }
      let newTimestamp = Date.parse(newQuote.generatedTimestamp).toString()

      if (newTimestamp > p.price.history[0].timestamp) {
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
        
        s? log(s) : null
      }
      else {
        /* tools.refreshLog(i, newTimestamp, p.ticker + ": Nothing to report...") */
      }
      p.lock = 0
    },
    draw() {
      console.log('HERE' + this.bought)
      const updateEvaluate = this.updateEvaluate
      const p = this.stock
      let mainColour
      if (this.bought) {
        mainColour = '#370aff'
      }
      else {
        mainColour = '#2E282A'
      }    
      this.renderChart(
        // data:
        {
          datasets: [{
              fill:false,
              //label: positions[i].ticker,
              backgroundColor: mainColour,
              borderColor: mainColour,
              lineTension:0,
              data: []
          }]
        },  
        // options:  
        {
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
                  fontColor: mainColour,
                  //fontStyle:'bold',
                  boxWidth:0,
              },
          },
          scales: {
              xAxes: [{                    
                  color:mainColour,    
                  gridLines: {
                      color:mainColour,
                      display:false
                  },
                  ticks: {
                    display:false
                  },
                  type: 'realtime',
                  realtime: {
                      onRefresh: async function(chart) {
                          await updateEvaluate()
                          
                          chart.data.datasets[0].data.push({
                              x:Date.now(),
                              y:p.price.current
                          })
                          chart.data.datasets[0].data = chart.data.datasets[0].data.slice(-10)

                          // adjust min/max of the chart if necessary
                          chart.options.scales.yAxes[0].ticks.min = Math.max(0, 0.995*p.price.min);
                          chart.options.scales.yAxes[0].ticks.max = 1.025*p.price.max;                              
                      },
                  }
              }],
              yAxes: [{
                  color:mainColour,
                  gridLines: {
                      color:mainColour
                  },
                  ticks: {
                      //suggestedMin: 0,
                      maxTicksLimit: 4
                  }
              }]
          }
        }
      );
      
    },
  },
  mounted () {
    this.draw()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
