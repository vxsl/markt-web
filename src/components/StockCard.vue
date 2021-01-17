<template>
  <div ref="outerContainer" class="chart-outer-container">
    <div ref="overlay" class="stock-overlay" @click="buyOrSell">
      <p ref="buySellLabel" class="buy-sell-label lead">{{ active ? "SELL" : "BUY" }}</p>
      <form ref="quantityInputContainer" class="quantity-input-container" @submit.prevent="buy">
        <input required v-model="quantity" type="number" name="quantity-input" value="1" min="1" max="1000">
        <input type="submit" :value="quantityMessage" ref="quantitySubmit">
      </form>
    </div>
    <div ref="chartContainer" class="chart-container">
      <div class="chart-extlabel">
      <h2>{{ ticker }}</h2>
      </div>
      <StockChart ref='chart' :stock="stock" :initPrice="initPrice" :active="active" :quantity="parseInt(quantity)" @redraw="redraw" :insane="insane" />
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
      initPrice: Number
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
    quantityMessage() {
      let result = 'BUY ' + this.quantity + ' SHARE'
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
      if (insaneVal) {
        this.$refs.outerContainer.classList.add('insane')
        if (!this.active) {
          this.$refs.chart.$el.classList.add('insane-invert')
          this.$refs.overlay.classList.add('insane-invert')
        }
      }
      else {
        this.$refs.outerContainer.classList.remove('insane')
        if (!this.active) {
          this.$refs.chart.$el.classList.remove('insane-invert')
          this.$refs.overlay.classList.remove('insane-invert')
        }
      }
    }
  },
  created() {
    this.$emit("newStockCard", this);
  },
  mounted() {
    if (this.insane) {
      this.$refs.outerContainer.classList.add('insane')
      this.$refs.chart.$el.classList.add('insane-invert')
      this.$refs.overlay.classList.add('insane-invert')
    }
  },
  methods: {
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
        this.initPrice = this.stock.price.current
        this.$refs.chart.initPrice = this.initPrice
        this.$emit('buy', this.ticker, this.quantity)
        this.active = true
        this.$refs.buySellLabel.style.display = "block"
        this.$refs.quantityInputContainer.style.display = "none"
        this.$refs.chartContainer.style.filter = 'none'
        this.$refs.outerContainer.classList.remove('inactive')
        this.$refs.outerContainer.classList.add('active')
        this.$refs.outerContainer.classList.add('neutral')
      }
      else {
        this.$emit('toast', 'Not enough cash', "Sorry, you don't have enough cash to purchase " + this.quantity + " shares of " + this.stock.ticker + ".")
      }
    },
    sell() {
      this.$emit('sell', this.ticker)
      this.active = false
    },
    redraw(newStatus) {
      if (newStatus != -1) {
        this.$refs.chart.$el.classList.remove('insane-invert')
        this.$refs.overlay.classList.remove('insane-invert')
      }
      this.$refs.outerContainer.classList = 'chart-outer-container '
      switch (newStatus) {
        case 2:
          this.$refs.outerContainer.classList += 'active positive'
          break
        case 1:
          this.$refs.outerContainer.classList += 'active neutral'
          break
        case 0:
          this.$refs.outerContainer.classList += 'active negative'
          break
        case -1:
        default:
          this.$refs.outerContainer.classList += 'inactive'
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "@/scss/custom.scss";
@import "@/scss/animations.scss";

.insane-invert {
  filter:invert(100%) !important;
}

canvas {
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
}
.chart-outer-container {
  border-radius:0.5em;
  animation: none !important;
  -webkit-animation: none !important;
  &.inactive {
    animation: none !important;
    -webkit-animation: none !important;
    .chart-container{
      border:solid;
      border-width:1px;
      border-color:$dark-color;
      .chart-extlabel {
        color:$dark-color;
      }
    }
  }
  &.inactive.insane {
    .chart-container{
      border-color:$light-color;
      .chart-extlabel {
        color:$light-color;
      }
    }
  }
  &.active {
    animation: pulse-animation 1s infinite !important; 
    -webkit-animation: pulse-animation 1s infinite alternate !important;
    .chart-container{
        border:none;
        .chart-extlabel {
          h2 {
            font-weight:700;
          }
        }
      }
    &.neutral {
      animation: pulse-animation 1s infinite !important; 
      -webkit-animation: pulse-animation 1s infinite alternate !important;
      .chart-container{
        border-color:$dark-color;
        .chart-extlabel {
          color:$dark-color;
        }
      }
    }
    &.negative {
      animation: negative-pulse-animation 1s infinite !important; 
      -webkit-animation: negative-pulse-animation 1s infinite alternate !important;
      .chart-container{
        border-color:$danger-color;
        .chart-extlabel {
          color:$danger-color;
        }
      }
    }
    &.positive {
      animation: positive-pulse-animation 1s infinite !important; 
      -webkit-animation: positive-pulse-animation 1s infinite alternate !important;
      .chart-container{
        border-color:$positive-color;
        .chart-extlabel {
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
    padding:1em;
    padding-top:0.5em;
    padding-bottom:0.5em;
    border:solid;
    border-color:$dark-color;
    border-width:1px;
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
  }
  &:hover > .buy-sell-label {
    opacity:1
  }
  &:hover + .chart-container {
    filter:blur(0.1em) !important;
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
