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
        <div class="sidebar">          
          <div class="inner-sidebar bg-dark text-light">
            <p class="lead table-title">BANK</p>
            <p class="table-sub">A summary of your finances is shown here.</p>
            <hr class="bg-light">
            <BankTable :positions='positions' :stocks='stocks' :bank="bank" :stats="bankStats"/>
            <p class="lead table-title">POSITIONS</p>
            <p class="table-sub">A summary of your positions is shown here.</p>
            <hr class="bg-light">
            <PositionsTable :positions='positions' :stocks='stocks'/>
          </div>
        </div>
        <div class="content">
          <div id="nav-container" ref="navContainer" fixed="top">
            <b-navbar id="nav" class="d-flex align-items-start">
              <div id="options" class="col-2">
                <p ref="optionsTitle" class="invert-on-insane">Options</p>
                <ToggleButton action="this.$emit('toggled', this.$refs.toggle.checked)" @toggled="toggleInsane" ref="toggleInsane" class="option-button alter-on-insane" onText="Insane mode" offText="Boring mode" />

              </div>
              <div class="col-8 terminal d-flex align-items-center">
                <div id="log-container" class="bg-dark text-light">
                    <Log id="log" ref="log" class="text-light"/>
                    <div class="clock-container d-flex align-items-end">
                      <Clock id="clock"/>
                    </div>
                </div>
              </div>
              <div id="title-box" class="col-2">
                <div ref="main-title" class="display-4 alter-on-insane">MARKT</div>
                <span class="break-here"></span>
                <div id="markt-subtitle" ref="main-subtitle" class="lead hide-on-insane">by <a href="https://kylegrimsrudma.nz">Kyle</a></div>
              </div>
            </b-navbar>
          </div>
          <div class="stocksGrid">
            <StockCard v-for="(stock, ticker) in stocks" class="rounded-card bg-light text-dark" :ref="ticker.replace(':', '')+'Chart'" :key="ticker" :ticker="ticker" :stock="stock" :insane="insane" @buy="newPosition" @sell="sellPosition"/>
            <DummyCard ref="dummy" class="rounded-card bg-light text-dark" @newStock="newStock"/>            
            <div v-if="true || Object.keys(stocks).length > 0" class="stocks-header">
              <p class="col-3 stocks-info-text">Click on a stock to purchase some shares.</p>
              
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
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
          insane: false,
          bank: {            
            cash:1000.00,
            positions:0.00,
            totalDeposited:1000.00,
          }
        }
  },
  computed: {
    bankStats() {
      let balance = this.bank.cash + this.bank.positions
      let diff = balance - this.bank.totalDeposited
      return {
        balance: balance,
        return: {
          dollar: diff,
          percent: diff / balance
        }
      }
    },
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
      this.bank.balance -= this.stocks[ticker].price.current * quantity
      this.$refs[ref][0].$children[0].draw()
    },
    sellPosition(ticker) {
      console.log('sell ' + this.stocks[ticker].price.current + " * " + this.positions[ticker].quantity)
      this.bank.balance += this.stocks[ticker].price.current * this.positions[ticker].quantity
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

.terminal {
  min-width:50%;
  #log-container {
    width:100%;
    height:20vh;
    .clock-container {
      float:right;
      height:100%;
      padding-bottom:0.5em;
      padding-right:0.75em;
      #clock {
        user-select:none;
        float:right;
        margin-bottom:0;
      }
    }
    #log {
      padding-left:1vw;
      padding-right:1vw;
    }
    overflow:hidden;
    position:relative;
    user-select:text;
    border:solid;
    border-left:none;
    border-bottom-left-radius:1em;
    border-bottom-right-radius:1em;
    border-width: 1px;
  }
}

.sidebar {
  user-select:none;
  position:absolute;
  top:0;
  left:0;
  width:30vw;
  height:100vh !important;
  padding:2vh;
  padding-right:0;
  padding-left:0;
  .inner-sidebar {
    position:relative;
    height:100%;
    border-top-right-radius:1em;
    border-bottom-right-radius:1em;

    padding:1em;
    p {
      margin-bottom:0;
      text-align:right;
    }
    .table-title {
      font-weight:400;
    }
    .table-sub {
      font-size:0.85em;
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
.stocksGrid {
  float:right;
  display: flex;
  width:100%;
  flex-direction: row;
  flex-wrap: wrap;
  position:relative;
  border-right:none !important;
  border-top-right-radius:0 !important;
  border-bottom-right-radius:0 !important;
  .rounded-card {
    border-radius:1em
  }
  .stocks-header {
    margin-top:1em;
    font-size:1em;
    .stocks-info-text {
      padding:1em;
      display:inline-block;
      padding-bottom:0;
      user-select:none;
    }
    width:100%;
    display:block;
  }
}
#options {

  float:right;
  border:solid;
  border-width:1px;
  border-bottom-right-radius:1em;
  border-bottom-left-radius:1em;
  border-top:none;

  .option-button {
    &.insane {
      -webkit-animation-name: shake;
      animation-name: shake;
      -webkit-animation-duration: 1s;
      animation-duration: 1s;
      -webkit-animation-fill-mode: both;
      animation-fill-mode: both;
    }
  }
}

.content {
  width:69vw;
  float:right
}
#nav-container {
  width:100%;
  height:20vh;
  position:relative;
  z-index:4;
  float:right;
  /* padding-top:1.2em;
  padding-bottom:1.2em;
  padding-right:2%; */
  user-select:none;
  margin-bottom:1em;
  #title-box {
    text-align:right;
    padding-right:2vw;
    #markt-title {
      width:100% !important;
      display:block !important;
      font-family:Rubik;
      font-weight:100;
    }
    #markt-subtitle {
      display:block;
    }
  }
  nav {
    padding:0;
  }
}

.nav-link {
  color:theme-color("primary") !important;
}

a:hover {
  font-weight:700;
}

</style>
