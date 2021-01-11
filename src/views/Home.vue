<template>
  <div>
    <transition name="fade">
      <div v-if="loading" class="spinner-splash min-vh-100 d-flex justify-content-center align-items-center">
        <div class="spinner-inner-container text-light">
          <b-spinner/>
          <span class="break-here"></span>
          <p class="lead">LOADING</p>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="!loading" id="page" ref="page">
        <div id="nav-container" ref="navContainer" fixed="top">
          <b-navbar id="nav">
            <div id="options" class="module">
              <p ref="optionsTitle" class="invert-on-insane">Options</p>
              <ToggleButton @toggled="toggleInsane" ref="toggleInsane" class="option-button alter-on-insane" onText="Insane mode" offText="Boring mode" />
            </div>
            <b-navbar-nav class="ml-auto" id="right-items">
              <div id="markt-title" ref="main-title" class="display-4 alter-on-insane">MARKT</div>
              <div id="markt-subtitle" ref="main-subtitle" class="lead hide-on-insane">a WIP by <a href="https://kylegrimsrudma.nz">Kyle</a></div>
            </b-navbar-nav>
          </b-navbar>
        </div>

        <div class="sidebar">
          <div class="upper-sidebar d-flex align-items-center">
            <div id="logContainer" class="bg-dark text-light">
                <Log id="log" ref="log" class="text-light"/>
                <Clock id="clock"/>
            </div>
          </div>
          <div class="lower-sidebar bg-dark text-light">
            <p class="lead table-title">BANK</p>
            <p class="table-sub">A summary of your finances is shown here.</p>
            <hr class="bg-light">
            <BankTable :positions='positions' :stocks='stocks' :bank="bank"/>
            <p class="lead table-title">POSITIONS</p>
            <p class="table-sub">A summary of your positions is shown here.</p>
            <hr class="bg-light">
            <PositionsTable :positions='positions' :stocks='stocks'/>
          </div>
        </div>
        <div class="stocksGrid module">
          <p v-if="Object.keys(stocks).length > 0" class="stocks-info-text">Click on a stock to purchase some shares.</p>
          <StockCard v-for="(stock, ticker) in stocks" class="rounded-card bg-light text-dark" :ref="ticker.replace(':', '')+'Chart'" :key="ticker" :ticker="ticker" :stock="stock" :insane="insane" @buy="newPosition" @sell="sellPosition"/>
          <DummyCard ref="dummy" class="rounded-card bg-light text-dark" @newStock="newStock"/>            
        </div>
      </div>
    </transition>
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
import PositionsTable from '@/components/PositionsTable.vue'
import BankTable from '@/components/BankTable.vue'


export default {

  name: 'Home',
  components: {
    StockCard,
    DummyCard,
    Log,
    Clock,
    ToggleButton,
    PositionsTable,
    BankTable
  },
  data() {
        return {
          loading: true,
          positions: {},
          stocks: {},
          bank: {
            balance:1000.00,
          },
          insane: false
        }
    },
  mounted() {
    window.addEventListener('load', () => {
      this.loading = false
    })
  },
  methods: {
    newStock(stock) {
      //this.stocks[stock.ticker] = stock
      this.$set(this.stocks, stock.ticker, stock)
      this.$refs.dummy.stopLoading()
    },
    newPosition(ticker, quantity) {
      this.$set(this.positions, ticker, {'quantity':quantity, 'sold':false})
      let ref = ticker.replace(':', '') + 'Chart'
      console.dir(this.$refs[ref])
      this.$refs[ref][0].$children[0].draw()
    },
    sellPosition(ticker) {
      this.$set(this.positions, ticker, {'quantity':0, 'sold':true})
    },
    toggleInsane(insane) {
      this.insane = insane;
      this.$emit('insane', this.insane)
    }
  }
}
</script>

<style lang="scss">
@import '@/scss/custom.scss';
@import '@/scss/animations.scss';

.fade-enter-active {
    transition: opacity 2s
}

.fade-enter,
.fade-leave-to,
.fade-leave-active {
    opacity: 0
}

.spinner-splash {
  background:theme-color("dark");
  user-select:none;
  flex-wrap:wrap;
  .spinner-inner-container {
    text-align:center;
    p {
      padding:1em;
      margin:0;
    }
    .break-here {
      flex-basis:100%
    }
  }
}

.sidebar {
  user-select:none;
  position:absolute;
  top:0;
  left:0;
  width:30%;
  height:100vh !important;
  .upper-sidebar {
    position:relative;
    height:40vh;
    #logContainer {
      width:100%;
      #clock {
        user-select:none;
        float:right;
        padding-right:2vh;
      }
      #log {
        height:30vh;
        padding-left:0;
      }
      overflow:hidden;
      position:relative;
      user-select:text;
      padding-left:4%;
      border:solid;
      border-left:none;
      border-top-right-radius:1em;
      border-bottom-right-radius:1em;
      border-width: 1px;
    }
  }
  .lower-sidebar {
    position:relative;
    height:60vh;
    border-top-right-radius:1em;
    padding:1em;
    p {
      margin-bottom:0;
      text-align:right;
    }
    .table-title {
      font-weight:400;
    }
    .table-sub {
      font-style:italic
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
}

.module {
  border:solid;
  border-width:1px;
  border-color:rgb(219, 219, 219);
  border-radius:1em;
  height:100%;
}
.stocksGrid {
  float:right;
  width:66%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  position:relative;
  border-right:none !important;
  border-top-right-radius:0 !important;
  border-bottom-right-radius:0 !important;
  .rounded-card {
    border-radius:1em
  }
  .stocks-info-text {
    padding:1em;
    padding-bottom:0;
    display:block;
    width:100%;
    user-select:none;
  }
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
  .option-button.insane {
    -webkit-animation-name: shake;
    animation-name: shake;
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
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
