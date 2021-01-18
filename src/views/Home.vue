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
    <Modal v-for="(dialog, title) in modals" :key="title" :closeable="dialog.closeable" :title="title" :message="dialog.message" @done="destroyModal"/>
    <transition name="fade">
      <div v-if="!loading && screenSize != 'mobile'" id="content" :class="screenSize">
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
              <div id="options" ref="options" class="col-2 bg-dark text-light">
                <p ref="optionsTitle" class="light-text-on-insane">OPTIONS</p>
                <ToggleButton action="this.$emit('toggled', this.$refs.toggle.checked)" @toggled="toggleInsane" ref="toggleInsane" class="option-button alter-on-insane" onText="Insane mode" offText="Boring mode" />
              </div>
              <div class="col-8 terminal d-flex align-items-center">
                <div id="log-container" class="bg-dark text-light">
                    <Log id="log" ref="log" class="text-light"/>
                </div>
              </div>
              <div id="title-box" class="col-2">
                <div ref="main-title" class="display-4 alter-on-insane">MARKT</div>
                <span class="break-here"></span>
                <div id="markt-subtitle" ref="main-subtitle" class="lead hide-on-insane">by <a href="https://kylegrimsrudma.nz">Kyle</a></div>
                <div class="clock-container d-flex align-items-end">
                  <Clock id="clock" ref="clock" class="light-text-on-insane"/>
                </div>
              </div>
            </b-navbar>
          </div>
          <div class="stocks-grid">
            <StockCard v-for="(stock, ticker) in stocks" class="stock-card" :ref="ticker.replace(':', '')+'Chart'" :key="ticker" :ticker="ticker" :stock="stock" :insane="insane" :bank="bank" @buy="buyPosition" @sell="sellPosition" @toast="toast"/>
            <DummyCard id="dummy" ref="dummy" class="bg-light text-dark invert-on-insane" :key="dummyRedrawFlag" :prompt="dummyPrompt" @promptDismissed="dummyPromptDismissed = true" @submitted="createStock"/>            
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
const { createStock } = require('@/js/stocks.js')
const { log } = require('@/js/log.js')

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
        trades:0
      },
      modals: {},
      dummyPrompt: false,
      dummyPromptDismissed: true,
      dummyRedrawFlag: false
    }
  },
  computed: {
    screenSize() {
      if (screen.width > 2400) {
        return 'xl'
      }
      else if (screen.width > 2000) {
        return 'l'
      }
      else if (screen.width > 760) {
        return 'm'
      }
      else {
        return 'mobile'
      }
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
  watch: {
    dummyPromptDismissed() {
      this.dummyPrompt = false
    }
  },
  mounted() {
    window.addEventListener('load', () => {
      this.loading = false
      if (this.screenSize != 'mobile') {
        this.$set(this.modals, 'WELCOME', 
          {
            message:"Try buying and selling some stocks. If you find the real stock market boring, you can try disabling boring mode...\n\nMarket data is retrieved using <a href=https://github.com/vxsl/bnnbloomberg-markets-api>my unofficial Javascript wrapper for BNN Bloomberg's market data API</a>.\nNote that although they advertise their quote data as realtime, in practice it is unfortunately not always reliable.\n\nAt this time, mostly Canadian stocks are available.\n\n\n<span style='float:right'><span style='font-style:italic'>Have fun!</span> 📈</span>",
            closeable:true
          })
      }
      else {
        this.$set(this.modals, 'WELCOME', 
          {
            message:"Unfortunately this webapp has not yet been optimized for mobile use. Please visit again on a larger display.",
            closeable:false
          })
      }
    })
  },
  methods: {
    destroyModal(title) {
      this.$delete(this.modals, title)
      if (title == 'WELCOME') {
        // TODO implement holiday check from https://www.marketbeat.com/stock-market-holidays/canada/
        let day = new Date().getDay() 
        if (day == 0 || day == 6) {
          let message = "Today is "
          message += (day == 0? 'Sunday' : 'Saturday')
          message += ", so not much is going to happen until you turn off boring mode..."
          setTimeout(() => {
            this.toast("Market closed", message, false)
          }, 1000)
        }

        setTimeout(() => {
          if (!this.dummyPromptDismissed) {
            this.dummyPrompt = true
          }
        }, 3000)
      }
    },
    toast(title, message, autohide = true) {
      let options = {
          title: title,
          toaster: 'b-toaster-bottom-right',
          noAutoHide: !autohide
        }
      autohide? null : options.id = title
      this.$bvToast.toast(message, options)
    },
    async createStock(input) {
      if (!this.stocks[input]) {
        try {
          let newStock = await createStock(input)
          this.$set(this.stocks, newStock.ticker, newStock)
          log('Successfully initialized ' + newStock.ticker + ' at $' + newStock.price.current + '.') 
        }
        catch (e) {
          this.toast('Error', 'Unable to add ' + input + '.\n\n' + e)
        }
      }
      else {
        this.toast('Error', 'Sorry, you may not add duplicate stocks.')
      }
      this.dummyRedrawFlag = !this.dummyRedrawFlag
      if (Object.keys(this.stocks).length == 1) {
        this.toast('Nice!', 'Click on a stock to buy some shares.')
      }
    },
    buyPosition(ticker, quantity) {
      let amount = this.stocks[ticker].price.current * quantity
      this.toast(ticker, 'Purchased ' + quantity + "x " + ticker + " for $" + parseFloat(amount).toFixed(2) + " total.")
      this.$set(this.positions, ticker, {'quantity':quantity, 'sold':false})
      let ref = ticker.replace(':', '') + 'Chart'
      this.bank.cash -= amount
      this.bank.positions += amount
      this.bank.trades += 1
    },
    sellPosition(ticker) {
      let soldPrice = this.stocks[ticker].price.current
      let initPrice = this.stocks[ticker].price.average
      let quantity = this.positions[ticker].quantity
      let amount = soldPrice * quantity
      this.bank.cash += amount
      this.bank.positions -= (this.stocks[ticker].price.average * quantity)
      this.$delete(this.positions, ticker)
      this.bank.trades += 1
      if (soldPrice > initPrice) {
        this.toast('Nice trade!', 'You just sold ' + quantity + " shares of " + ticker + " for a net profit of $" + parseFloat((soldPrice - initPrice) * quantity).toFixed(2) + ".")
      }
      else if (soldPrice == initPrice) {
        this.toast(ticker, 'You just sold ' + quantity + " shares of " + ticker + " for the same price at which they were purchased.")
      }
      else if (soldPrice < initPrice) {
        this.toast('Ouch...', 'You just sold ' + quantity + " shares of " + ticker + " for a net loss of -$" + parseFloat((initPrice - soldPrice) * quantity).toFixed(2) + ".")
      }
    },
    toggleInsane(insane) {
      this.$bvToast.hide('Market closed')
      this.insane = insane;
      this.$emit('insane', this.insane)
    }
  }
}
</script>

<style lang="scss">
@import '@/scss/custom.scss';
@import '@/scss/animations.scss';

#content {
  &.xl {
    font-size:1.3em;
  }
}

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
    user-select:none;
    width:100%;
    height:20vh;
    #log {
      padding-left:1vw;
      padding-right:1vw;
    }
    overflow:hidden;
    position:relative;
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
  padding-bottom:2vh;
  .inner-sidebar {
    position:relative;
    height:100%;
    border-bottom-right-radius:1em;
    padding:1em;
    p {
      margin-bottom:0;
      text-align:left;
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


.stocks-grid {
  float:right;
  display: flex;
  width:100%;
  padding-right:3em;
  flex-direction: row;
  flex-wrap: wrap;
  position:relative;
  border-right:none !important;
  border-top-right-radius:0 !important;
  border-bottom-right-radius:0 !important;

  .stock-card {
    width:20%;
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
    height:20vh;
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
    .clock-container {
      position:absolute;
      top:0;
      height:100%;
      #clock {
        user-select:none;
        margin-bottom:0;
      }
    }
  }
  nav {
    padding:0;
  }
  
  #options {
    padding:1em;
    text-align:center;
    border:solid;
    min-height:20vh;
    border-width:1px;
    border-bottom-right-radius:1em;
    border-bottom-left-radius:1em;
    border-top:none;
    border-color:$light-color;
    .option-button {
      .tgl-btn {
        width:100%;
        border-color:$light-color;
      }
      &.insane{
        -webkit-animation-name: shake;
        animation-name: shake;
        -webkit-animation-duration: 1s;
        animation-duration: 1s;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both;
      }
    }
    &.insane {
      border-color:$light-color;
    }
  }
}

.nav-link {
  color:$primary-color !important;
}

a:hover {
  font-weight:700;
}

</style>
