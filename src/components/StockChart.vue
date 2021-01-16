<script>
import Chart from 'chart.js'
import { Line } from 'vue-chartjs'
import '@taeuk-gang/chartjs-plugin-streaming';
const { log } = require('@/js/log.js')
import colors from '@/scss/custom.scss'

export default {
  data() {
    return {
      initPrice: Number
    }
  },
  name: 'StockChart',
  extends: Line,
  props: {
    active: Boolean,
    insane: Boolean,
    stock: {

    },
    quantity: Number,
    plugins: [{
        /* Adjust label font size according to chart size */
            beforeDraw: function(c) {
              c.options.legend.labels.fontSize = c.chart.height * 0.07;
            },
            //streaming: 30
        }],
  },
  computed: {
    status() {
      if (this.active) {
        let diff = this.stock.price.current - this.initPrice
        if (diff > 0) {
          return 2
        }
        else if (diff == 0) {
          return 1
        }
        else if (diff < 0) {
          return 0
        }
      }
      return -1
    },
    color() {
      switch (this.status) {
        case 2:
          return colors.positiveColor
        case 1:
          return this.insane? colors.lightColor : colors.darkColor
        case 0:
          return colors.dangerColor
        case -1:
        default:
          return colors.darkColor
      }
    }
  },
  watch: {
    color(newColor) {
      this.$data._chart.options.scales.xAxes[0].color = newColor
      this.$data._chart.options.scales.yAxes[0].gridLines.color = newColor
      this.$data._chart.options.scales.yAxes[0].ticks.fontColor = newColor
      this.$data._chart.options.legend.labels.fontColor = newColor
      this.$data._chart.update({preservation:true})
      this.$emit('redraw', this.status)
    },
    insane(insaneVal) {
      if (insaneVal && this.active) {
        this.$data._chart.config.data.datasets[0].borderColor = colors.lightColor
      }
      else {
        this.$data._chart.config.data.datasets[0].borderColor = colors.darkColor
      } 
    }
  },
  methods: {
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
      p.lock = 0
    },
    draw() {
      const updateEvaluate = this.updateEvaluate
      const p = this.stock
      
      this.renderChart(
        // data:
        {
          datasets: [{
              fill:false,
              borderColor: this.color,
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
  mounted () {
    this.draw()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
