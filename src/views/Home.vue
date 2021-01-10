<template>
  <div id="page">

    <div id="nav-container" fixed="top">
      <b-navbar id="nav">
        <div id="options" class="module">
          <p>Options</p>
          <ToggleButton @toggled="toggleInsane" class="option-button" onText="Insane mode" offText="Boring mode" />
        </div>
        <b-navbar-nav class="ml-auto" id="right-items">
          <div id="markt-title" class="display-4">MARKT</div>
          <div id="markt-subtitle" class="lead">made by <a href="https://kylegrimsrudma.nz">Kyle</a></div>
        </b-navbar-nav>
      </b-navbar>
    </div>

    <div class="sidebar bg-dark text-light">
      <div id="logContainer">
          <Log id="log" ref="log"/>
          <Clock/>
      </div>
    <div> 
        <table id="positionsData" class="table table-dark">
          <thead>
            <tr>
              <th></th>
              <th>Quantity</th>
              <th>Value</th>
              <th>Margin</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(position, ticker) in positions" :key="ticker">
                <td>{{ticker}}</td>
                <td>{{position.quantity}}</td>
                <td>{{parseFloat(stocks[ticker].price.current).toFixed(2)}}</td>
                <td>{{parseFloat(stocks[ticker].price.max).toFixed(2)}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="stocksTable module">
      <StockCard v-for="(stock, ticker) in stocks" :key="ticker" :ticker="ticker" :stock="stock" :insane="insane" @buy="newPosition" @sell="sellPosition"/>
      <DummyCard ref="dummy" @newStock="newStock"/>            
    </div>
  </div>
</template>

<!--
/* require('@/js/charts/chartsConfig.js')
require('@/js/charts/charts.js') */
<script src="js/logs.js"></script>
<script src="js/terminal.js"></script>
-->
<script>
//require('@/js/app/app.js')
const appLink = require('@/js/app/appLink.js')
//require('@/js/data/knownSymbols.js')
import ToggleButton from '@/components/ToggleButton.vue'
import Log from '@/components/Log.vue'
import Clock from '@/components/Clock.vue'
import StockCard from '@/components/StockCard.vue'
import DummyCard from '@/components/DummyCard.vue'

export default {

  name: 'Home',
  components: {
    StockCard,
    DummyCard,
    Log,
    Clock,
    ToggleButton
  },
  data() {
        return {
          positions: {},
          stocks: {},
          balance:1000.00,
          insane: false
        }
    },
  mounted() {
    console.dir(this)
    console.log(this.$refs.log.stream === this.$refs.dummy.link.logEmitter)
    console.dir(this.$refs.dummy.link.logEmitter)
    console.log(this.test)
  },
  methods: {
    newStock(stock) {
      //this.stocks[stock.ticker] = stock
      this.$set(this.stocks, stock.ticker, stock)
      this.$refs.dummy.stopLoading()
    },
    newPosition(ticker, quantity) {
      this.$set(this.positions, ticker, {'quantity':quantity, 'sold':false})
    },
    sellPosition(ticker) {
      this.$set(this.positions, ticker, {'quantity':0, 'sold':true})
    },
    toggleInsane(insane) {
      this.insane = insane
    }
  }
}
</script>

<style lang="scss">
@import '@/scss/custom.scss';


.sidebar {
  user-select:none;
  position:absolute;
  top:0;
  left:0;
  width:30%;
  height:100vh !important;
  border-right:solid;
  border-right-width:1px;
  #log {
    height:40vh;
    padding-left:0;
    margin:0.2em;
  }
  #logContainer {
    user-select:text;
    padding-left:4%;
    border:solid;
    border-left:none;
    border-top-right-radius:1em;
    border-bottom-right-radius:1em;
    border-width: 1px;
    margin:2em;
    margin-left:0;
  }
  .sidebar-padded {
    padding:1em;
    padding-left:0;
  }
  table {
    width:100%;
    border-collapse: collapse;
    tr, td {
      text-align:left;
      vertical-align:middle
    }
  }
}


#logContainer > pre * {    
    white-space:pre-wrap;
    font-size:.8vw;
    word-wrap: break-word;
}

#page {
}
.module {
  border:solid;
  border-width:1px;
  border-color:rgb(219, 219, 219);
  border-radius:1em;
  height:100%;
}
.stocksTable {
  float:right;
  width:66%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  position:relative;
  border-right:none !important;
  border-top-right-radius:0 !important;
  border-bottom-right-radius:0 !important;
}

canvas {
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
}
.chart-container-container {
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


#options {
  padding:1em;
  width:50%;
  .option-button {
    width:auto
  }
}

#right-items {
  display:block;
  float:right;
  text-align:right;
  font-weight:700;
}
#nav-container {
  position:relative;
  z-index:4;
  width:66%;
  float:right;
  padding-top:1.2em;
  padding-bottom:1.2em;
  padding-right:2%;
  user-select:none;
  #markt-title {
    font-family:Rubik;
    font-weight:100;
  }
  #markt-subtitle {
    margin-right:5%;
  }
}

.nav-link {
  color:theme-color("primary") !important;
}

a:hover {
  font-weight:700;
}

</style>
