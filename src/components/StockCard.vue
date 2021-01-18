<template>
  <div ref="outerContainer" class="chart-outer-container" :class="statusClass + ' ' + insaneClass">
    <div ref="overlay" class="stock-overlay" @click="buyOrSell">
      <p ref="buySellLabel" class="buy-sell-label lead">{{ active ? "SELL" : "BUY" }}</p>
      <form ref="quantityInputContainer" class="quantity-input-container" @submit.prevent="buy">
        <input required v-model="quantity" type="number" name="quantity-input" value="1" min="1" max="1000">
        <input type="submit" :value="quantityMessage" ref="quantitySubmit">
      </form>
    </div>
    <div ref="chartContainer" class="chart-container">
      <div class="padded">
        <div class="chart-extlabel">
        <h2 ref="title">{{ ticker }}</h2>
        </div>
        <StockChart ref='chart' :stock="stock" :initPrice="initPrice" :active="active" :quantity="parseInt(quantity)" @redraw="redraw" :insane="insane" />
      </div>
      <div class="chart-footer">
        <table class="table w-100" ref="footerTable">
            <tbody>
                <tr>
                    <th>VAL.</th>
                    <td>${{parseFloat(stock.price.current).toFixed(2)}}</td>
                </tr>
                <tr v-if="active">
                    <th>INIT.</th>
                    <td>${{initPrice}}</td>
                </tr>
                <tr v-if="active">
                    <th>NET</th>
                    <td :class="statusClass">{{net}}</td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import StockChart from "@/components/StockChart.vue";

export default {
  data() {
    return {
      active: false,
      quantity: 1,
      initPrice: Number,
      statusClass: String,
      insaneClass: String
    };
  },
  components: {
    StockChart,
  },
  props: {
    ticker: String,
    stock: {},
    insane: Boolean,
    bank: Object
  },
  computed: {
    net() {
      let diff = this.stock.price.current - this.initPrice
      let result = ''
      if (diff >= 0) {
        result = "+ $"  
      }
      else {
        result = "- $"
        diff = -diff
      }
      return result += parseFloat(diff * this.quantity).toFixed(2)
    },
    quantityMessage() {
      let result = 'BUY ' + this.quantity + ' STOCK'
      this.quantity > 1? result += 'S' : null
      result += ' ' + this.ticker + ' [$' 
      result += parseFloat(this.quantity * this.stock.price.current).toFixed(2)
      result += ']'
      return result
    }
  },
  watch: {
    active(activeVal) {
      if (activeVal) {
        this.$refs.outerContainer.classList.remove('inactive')
        this.$refs.outerContainer.classList.add('active')
      }
      else {
        this.$refs.outerContainer.classList.remove('active')
        this.$refs.outerContainer.classList.add('inactive')
      }
    },
    insane(insaneVal) {
      this.toggleInsaneStyling(insaneVal)
    }
  },
  created() {
    this.$emit("newStockCard", this);
  },
  mounted() {
    this.toggleInsaneStyling(this.insane)
    setTimeout(() => {
      this.$refs.buySellLabel.style.opacity = 1
      this.$refs.chartContainer.style.filter = 'blur(0.3em)'
      setTimeout(() => {
        this.$refs.buySellLabel.style.opacity = 0
        this.$refs.chartContainer.style.filter = 'none'
      }, 1000)
    }, 1000)
  },
  methods: {
    toggleInsaneStyling(insaneVal) {
      if (insaneVal) {
        this.insaneClass = 'insane'
        this.$refs.footerTable.classList.add('text-light')
        this.$refs.buySellLabel.classList.add('text-light')
      }
      else {
        this.insaneClass = ''
        this.$refs.footerTable.classList.remove('text-light')
        this.$refs.buySellLabel.classList.remove('text-light')
      }
    },
    buyOrSell() {
      if (this.active) {
        this.sell()
      }
      else {
        this.$refs.buySellLabel.style.display = "none"
        this.$refs.quantityInputContainer.style.display = "block"
        this.$refs.chartContainer.style.filter = 'blur(0.3em)'
      }
    },
    buy() {
      let tentativePrice = this.stock.price.current * this.quantity
      if (this.bank.cash >= tentativePrice) {
        this.initPrice = parseFloat(this.stock.price.current).toFixed(2)
        this.$refs.chart.initPrice = this.initPrice
        this.$emit('buy', this.ticker, this.quantity)
        this.active = true
        this.$refs.buySellLabel.style.display = "block"
        this.$refs.buySellLabel.style.opacity = 0
        this.$refs.quantityInputContainer.style.display = "none"
        this.$refs.chartContainer.style.filter = 'none'
        this.$refs.outerContainer.classList.remove('inactive')
        this.$refs.outerContainer.classList.add('active')
        this.$refs.outerContainer.classList.add('neutral')
        this.toggleInsaneStyling(this.insane)
      }
      else {
        this.$emit('toast', 'Not enough cash', "Sorry, you don't have enough cash to purchase " + this.quantity + " " + this.stock.ticker + " stocks.")
      }
    },
    sell() {
      this.$emit('sell', this.ticker)
      this.active = false
      this.statusClass = 'inactive'
    },
    redraw(newStatus) {
      switch (newStatus) {
        case 2:
          this.statusClass = 'active positive'
          break
        case 1:
          this.statusClass = 'active neutral'
          break
        case 0:
          this.statusClass = 'active negative'
          break
        case -1:
        default:
          this.statusClass = 'inactive'
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "@/scss/custom.scss";
@import "@/scss/animations.scss";

canvas {
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
}
.chart-outer-container {
  border-radius:0.5em;
  animation: none !important;
  -webkit-animation: none !important;
  &.insane, &.inactive.insane, &.active.insane.neutral{
    .chart-container {
      border-color:$light-color;
      .padded > .chart-extlabel {
        color:$light-color;
      }
    } 
  }
  &.inactive {
    animation: none !important;
    -webkit-animation: none !important;
    .chart-container{
      border:solid;
      border-width:1px;
      border-color:$dark-color;
      .padded > .chart-extlabel {
        color:$dark-color;
      }
    }
  }
  &.active {
    animation: pulse-animation 1s infinite !important; 
    -webkit-animation: pulse-animation 1s infinite alternate !important;
    .chart-container{
      border:none;
    }
    &.neutral {
      animation: pulse-animation 1s infinite !important; 
      -webkit-animation: pulse-animation 1s infinite alternate !important;
      .chart-container{
        .padded > .chart-extlabel {
          color:$dark-color;
        }
      }
    }
    &.negative {
      animation: negative-pulse-animation 1s infinite !important; 
      -webkit-animation: negative-pulse-animation 1s infinite alternate !important;
      .chart-container{
        border-color:$danger-color;
        .padded > .chart-extlabel {
          color:$danger-color;
        }
      }
    }
    &.positive {
      animation: positive-pulse-animation 1s infinite !important; 
      -webkit-animation: positive-pulse-animation 1s infinite alternate !important;
      .chart-container{
        border-color:$positive-color;
        .padded > .chart-extlabel {
          color:$positive-color;
        }
      }
    }
  }

  position:relative;
  width:20%;
  margin:1em;
  user-select:none;
  .chart-container{
    transition: filter 0.5s;
    border-radius:0.5em;
    overflow:hidden;
    height:100%;
    .padded {
      padding:1em;
      padding-top:0.5em;
      .chart-extlabel {
        width:100%;
        color:$dark-color;
        padding-bottom:1%;
        margin-bottom:0.6em;
        text-align:right;
        border-bottom:solid;
        border-bottom-width:1px;
        h2 {
            font-size:1.3vw;
            vertical-align:middle;
            margin:0;
        }
      }
    }
    border:solid;
    border-color:$dark-color;
    border-width:1px;
    .chart-footer {
      table {
        td.active.positive {
          color:$positive-color
        }
        td.active.negative {
          color:$danger-color
        }
        th {
          font-weight:400;
        }
        td {
          font-weight:700;
        }
        margin-bottom:0 !important;
      }
    }
  }
}

.stock-overlay {
  user-select: none;
  position: absolute;
  z-index: 2;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  p {
    font-size:1.5em;
    font-weight:400;
    user-select: none;
    color: $dark-color;
    margin-bottom: 0 !important;
  }
  .buy-sell-label {
    display:block;
    opacity:0;
    transition: opacity 0.5s;
  }
  &:hover > .buy-sell-label {
    opacity:1 !important;
  }
  &:hover + .chart-container {
    filter:blur(0.2em) !important;
  }  
  .quantity-input-container {
    display:none;
    text-align:center;
    input {
      max-width:80%;
      white-space:pre-wrap;
      word-wrap: break-word;
      margin:5%;
    }
  }
}


</style>
