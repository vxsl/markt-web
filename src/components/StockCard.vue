<template>
  <div class="chart-outer-container">
    <div ref="overlay" id="stock-overlay" @click="buyOrSell">
      <p ref="buySellLabel" class="buy-sell-label lead">{{ bought ? "SELL" : "BUY" }}</p>
      <form ref="quantityInputContainer" class="quantity-input-container" @submit.prevent="buy">
        <input required v-model="quantity" type="number" name="quantity-input" value="1" min="1" max="1000">
        <input type="submit" :value="quantityMessage" ref="quantitySubmit">
      </form>
    </div>
    <div ref="chartContainer" class="chart-container">
      <div class="chart-extlabel">
      <h2>{{ ticker }}</h2>
      </div>
      <StockChart :stock="stock" :initPrice="initPrice" :bought="bought" :quantity="quantity" :insane="insane" />
    </div>
  </div>
</template>

<script>
import StockChart from "@/components/StockChart.vue";

export default {
  data() {
    return {
      bought: false,
      quantity: 1,
      initPrice: Number
    };
  },
  props: {
    ticker: String,
    stock: {},
    insane: Boolean,
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
  components: {
    StockChart,
  },
  created() {
    this.initPrice = this.stock.price.current
    this.$emit("newStockCard", this);
  },
  methods: {
    buyOrSell() {
      if (this.bought) {
        this.sell()
      }
      else {
        this.$refs.buySellLabel.style.display = "none"
        this.$refs.quantityInputContainer.style.display = "block"
        this.$refs.chartContainer.style.filter = 'blur(0.3em)'
      }
    },
    buy() {
      this.$emit('buy', this.ticker, this.quantity)
      this.bought = true
      this.$refs.buySellLabel.style.display = "block"
      this.$refs.quantityInputContainer.style.display = "none"
      this.$refs.chartContainer.style.filter = 'none'
    },
    sell() {
      this.$emit('sell', this.ticker)
      this.bought = false
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "@/scss/custom.scss";

canvas {
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
}
.chart-outer-container {
    position:relative;
    width:20%;
    margin:1em;
    user-select:none;
}
.chart-container{
    overflow:hidden;
    height:100%;
    padding:1em;

    /*
    width: 500px;
    margin-left: 40px;
    margin-right: 40px;
    margin-bottom: 40px;*/
    /* box-sizing:border-box; */
    border:solid;
    border-color:rgb(61,61,61);
    border-width:1px;
    border-radius: 1em;
}

.chart-extlabel {
    width:100%;
    color:rgb(1,61,61);
    padding-bottom:1%;
    margin-bottom:0.6em;
    padding-top:1%;
    text-align:right;
    border-bottom:solid;
    border-bottom-width:1px
}
.chart-extlabel > h2 {
    font-size:1vw;
    vertical-align:middle;
    padding-right:10%;
    padding-top:2%;
    padding-bottom:1%;
    margin:0;
}

#stock-overlay {
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
