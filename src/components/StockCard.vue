<template>
  <div class="chart-container-container">
    <div ref="overlay" id="stock-overlay" @click="buyOrSell">
      <p ref="buySellLabel" class="buy-sell-label lead">{{ bought ? "SELL" : "BUY" }}</p>
      <form ref="quantityInputContainer" class="quantity-input-container" @submit.prevent="buy">
        <input required type="number" ref="quantityInput" name="quantity-input" min="1" max="1000" @change="getTentativePurchasePrice">
        <input type="submit" value="Buy" ref="quantitySubmit">
      </form>
    </div>
    <div ref="chartContainer" class="chart-container">
      <div class="chart-extlabel">
        <h2>{{ ticker }}</h2>
      </div>
      <!-- <canvas></canvas> -->
      <StockChart :stock="stock" :bought="bought" :insane="insane" />
    </div>
  </div>
</template>

<script>
import StockChart from "@/components/StockChart.vue";

export default {
  data() {
    return {
      bought: false,
      quantity: Number,
    };
  },
  props: {
    ticker: String,
    stock: {},
    insane: Boolean,
  },
  components: {
    StockChart,
  },
  created() {
    this.$emit("newStockCard", this);
  },
  methods: {
    getTentativePurchasePrice() {
      let result = 'Buy [$' 
      result += parseFloat(this.$refs.quantityInput.value * this.stock.price.current).toFixed(2)
      result += ']'
      this.$refs.quantitySubmit.value = result
    },
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
      this.$emit('buy', this.ticker, this.$refs.quantityInput.value)
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
<style scoped lang="scss">

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
    color: theme-color("dark");
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
