<script>
import Chart from 'chart.js'
import { Line } from 'vue-chartjs'
import '@taeuk-gang/chartjs-plugin-streaming';
const { log } = require('@/js/log.js')
import colors from '@/scss/custom.scss'

export default {
  name: 'StockChart',
  extends: Line,
  props: {
    active: Boolean,
    insane: Boolean,
    stock: Object,
    position: Object,
  },
  computed: {
    color() {
      if (this.active) {
        if (this.position.net > 0) {
          return colors.positiveColor
        }
        else if (this.position.net < 0) {
          return colors.dangerColor
        }
      }
      return this.insane? colors.darkGreyColor : colors.lightGreyColor
    }
  },
  watch: {
    color(newColor) {
      this.$data._chart.options.scales.xAxes[0].color = newColor
      this.$data._chart.options.scales.yAxes[0].gridLines.color = newColor
      this.$data._chart.options.scales.yAxes[0].ticks.fontColor = newColor
      this.$data._chart.options.legend.labels.fontColor = newColor
    },
    insane(insaneVal) {
      this.$data._chart.config.data.datasets[0].borderColor = insaneVal ? colors.lightColor : colors.darkColor
    }
  },
  mounted () {
    this.draw()
    this.updateInfinitely()
  },
  methods: {
    async updateInfinitely() {
      for (;;) {
        await this.updateEvaluate()
      }
    },
    async updateEvaluate() {
      let p = this.stock
      
      let newQuote = await p.quoter.quote()
      if (this.insane) {
        if (Math.random() > 0.5) {
          newQuote.data.stocks[0].price += Math.random()
        }
        else {
          newQuote.data.stocks[0].price -= Math.random()
        }
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
    },
    draw() {
      const p = this.stock
      
      this.renderChart(
        // data:
        {
          datasets: [{
              fill:false,
              borderColor: this.insane? colors.lightColor : colors.darkColor,
              borderWidth: 1,
              lineTension:0.4,
              data: []
          }]
        },  
        // options:  
        {
          plugins: {
            streaming: {            
              refresh:150
            }
          },
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
                  fontColor: this.color,
                  boxWidth:0,
              },
          },
          scales: {
              xAxes: [{                    
                  color:this.color,    
                  gridLines: {
                      display:false
                  },
                  ticks: {
                    display:false
                  },
                  type: 'realtime',
                  realtime: {
                      onRefresh: async function(chart) {
                          chart.data.datasets[0].data.push({
                              x:Date.now(),
                              y:p.price.current
                          })

                          // adjust min/max of the chart if necessary
                          chart.options.scales.yAxes[0].ticks.min = Math.max(0, 0.995*p.price.min);
                          chart.options.scales.yAxes[0].ticks.max = 1.025*p.price.max;                              
                      },
                  }
              }],
              yAxes: [{
                  gridLines: {
                      color:this.color
                  },
                  ticks: {
                      //suggestedMin: 0,
                      maxTicksLimit: 4,
                      fontColor:this.color
                  }
              }]
          }
        }
      );
      
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
