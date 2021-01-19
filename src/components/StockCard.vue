<template>
  <div ref="outerContainer" class="chart-outer-container" :class="[positionStatusClass, insaneClass, userInputClass]">
    <div ref="overlay" class="stock-overlay" @click="buyOrSell">
      <p ref="buySellLabel" class="buy-sell-label lead">{{ active ? "SELL" : "BUY" }}</p>
      <form class="quantity-input-container" @submit.prevent="buy">
        <input required v-model="purchaseQuantity" type="number" name="quantity-input" value="1" min="1" max="9999">
        <input type="submit" :value="quantityMessage" ref="quantitySubmit">
      </form>
    </div>
    <div ref="chartContainer" class="chart-container">
      <div class="padded">
        <div class="chart-extlabel">
        <h2 ref="title">{{ stock.ticker }}</h2>
        </div>
        <StockChart ref='chart' :stock="stock" :position="position" :active="active" :insane="insane" />
      </div>
      <div class="chart-footer">
        <table class="table w-100" ref="footerTable">
            <tbody>
                <tr>
                    <th>VAL</th>
                    <td>${{parseFloat(stock.price.current).toFixed(2)}}</td>
                </tr>
                <tr v-if="active">
                    <th>INIT</th>
                    <td>${{parseFloat(position.initPrice).toFixed(2)}}</td>
                </tr>
                <tr v-if="active">
                    <th>NET</th>
                    <td :class="positionStatusClass">{{position.netString}}</td>
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
      userInput: false,
      purchaseQuantity:1
    };
  },
  components: {
    StockChart,
  },
  props: {
    ticker:String,
    stock: Object,
    position: Object,
    insane: Boolean,
    bank: Object
  },
  computed: {
    active() {
      if (this.position) {
        return !this.position.sold
      }
      return false
    },
    quantityMessage() {
      let result = 'BUY ' + this.purchaseQuantity + ' STOCK'
      this.purchaseQuantity > 1? result += 'S' : null
      result += ' ' + this.stock.ticker + ' [$' 
      result += parseFloat(this.purchaseQuantity * this.stock.price.current).toFixed(2)
      result += ']'
      return result
    },
    insaneClass() {
      return this.insane? 'insane' : ''
    },
    userInputClass() {
      return this.userInput? 'user-input' : ''
    },
    positionStatusClass() {
      if (this.active) {
        if (this.position.net > 0) {
          return 'active positive'
        }
        else if (this.position.net == 0) {
          return 'active neutral'
        }
        else {
          return 'active negative'
        }
      }
      return 'inactive'
    }
  },
  created() {
    this.$emit("newStockCard", this);
  },
  mounted() {
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
    buyOrSell() {
      this.active? this.sell() : this.userInput = true
    },
    buy() {
      let tentativePrice = this.stock.price.current * this.purchaseQuantity
      if (this.bank.cash >= tentativePrice) {
        this.$emit('buy', this.stock.ticker, this.purchaseQuantity)
        this.userInput = false
      }
      else {
        this.$emit('toast', 'Not enough cash', "Sorry, you don't have enough cash to purchase " + this.purchaseQuantity + " " + this.stock.ticker + " stocks.")
      }
    },
    sell() {
      this.$emit('sell', this.stock.ticker)
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
    .stock-overlay {
      .buy-sell-label {
        color:$light-color;
      }
    }
    .chart-container {
      border-color:$light-color;
      .padded > .chart-extlabel {
        color:$light-color;
      }
      .chart-footer {
        table {
          color:$light-color;
        }
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

  &.user-input {
    .buy-sell-label {
      display:none
    }
    .quantity-input-container {
      display:block
    }
    .chart-container {
      filter:blur(0.3em)
    }
  }

  position:relative;
  width:20%;
  margin:1em;
  user-select:none;
  .chart-container{
    filter:none;
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
        transition:color 0.5s;
        color:$dark-color;
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
    color:$dark-color;
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
