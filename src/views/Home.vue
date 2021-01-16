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
    <Modal v-for="(dialog, title) in modals" :key="title" :closeable="dialog.closeable" :title="title" :message="dialog.message" @done="$delete(modals, title)"/>
    <transition name="fade">
      <div v-if="!loading && !mobile" id="page" ref="page">
        <div class="sidebar">          
          <div class="inner-sidebar bg-dark text-light">
            <div id="bank">
              <p class="lead table-title">BANK</p>
              <p class="table-sub">A summary of your finances is shown here.</p>
              <hr class="bg-light">
              <BankTable :positions='positions' :stocks='stocks' :bank="bank" :stats="bankStats"/>
            </div>
            <div id="positions">
              <p class="lead table-title">POSITIONS</p>
              <p class="table-sub">A summary of your positions is shown here.</p>
              <hr class="bg-light">
            </div>
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
            <StockCard v-for="(stock, ticker) in stocks" class="rounded-card" :ref="ticker.replace(':', '')+'Chart'" :key="ticker" :ticker="ticker" :stock="stock" :insane="insane" :bank="bank" @buy="buyPosition" @sell="sellPosition" @toast="childToast"/>
            <DummyCard ref="dummy" class="rounded-card bg-light text-dark" @newStock="newStock"/>            
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import ToggleButton from '@/components/ToggleButton.vue'
import Modal from '@/components/Modal.vue'
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
    BankTable,
    Modal
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
      },
      modals: {}
    }
  },
  computed: {
    mobile() {
      return screen.width <= 760? true : false
    },
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
      if (!this.mobile) {
        this.$set(this.modals, 'Welcome to markt!', 
          {
            message:"Try buying and selling some stocks.\n\nMarket data is retrieved using <a href=https://github.com/vxsl/bnnbloomberg-markets-api>my wrapper for BNN Bloomberg's market data API</a>.\n\nIf you find the real stock market boring, you can disable boring mode and give insane mode a try...",
            closeable:true
          })
        this.toast('Warning', 'Please note that this project is still a WIP, and many features are still missing.')
      }
      else {
        this.$set(this.modals, 'Welcome to markt!', 
          {
            message:"Unfortunately this webapp has not yet been optimized for mobile use. Please visit again on a larger display.",
            closeable:false
          })
      }
    })
  },
  methods: {
    toast(title, message, append = false) {
      this.$bvToast.toast(message, {
        title: title,
        toaster: 'b-toaster-bottom-right',
        solid: true,
        appendToast: append
      })
    },
    childToast(title, message) {
      this.toast(title, message)
    },
    newStock(stock) {
      if (this.stocks[stock.ticker]) {
        this.toast('Error', 'Sorry, you may not add duplicate stocks.')
        return
      }
      else if (Object.keys(this.stocks).length == 0) {
        this.toast('Nice!', 'Click on a stock to buy some shares.')
      }
      this.$set(this.stocks, stock.ticker, stock)
      this.$refs.dummy.stopLoading()
    },
    buyPosition(ticker, quantity) {
      this.$set(this.positions, ticker, {'quantity':quantity, 'sold':false})
      let ref = ticker.replace(':', '') + 'Chart'
      let amount = this.stocks[ticker].price.current * quantity
      this.bank.cash -= amount
      this.bank.positions += amount
    },
    sellPosition(ticker) {
      console.log('sell ' + this.stocks[ticker].price.current + " * " + this.positions[ticker].quantity)
      let amount = this.stocks[ticker].price.current * this.positions[ticker].quantity
      this.bank.cash += amount
      this.bank.positions -= amount
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
  background:$dark-color;
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
    border-top:none;
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
    #positions {
      margin-top:2em;
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
  color:$primary-color !important;
}

a:hover {
  font-weight:700;
}

</style>
