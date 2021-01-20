<template>
  <div>
    <div v-if="loading" class="spinner-splash min-vh-100 d-flex justify-content-center align-items-center">
      <div class="spinner-inner-container text-light">
        <b-spinner/>
        <span class="break-here"></span>
        <p class="lead">LOADING</p>
      </div>
    </div>
    <Modal 
      v-for="(dialog, title) in modals" 
      :key="title" 
      :closeable="dialog.closeable" 
      :title="title" 
      :message="dialog.message" 
      @done="destroyModal"
    />
    <div v-if="!loading && screenSize != 'mobile'" id="content" :class="screenSize">
      <div class="sidebar">          
        <div class="inner-sidebar bg-dark text-light">
          <div id="bank">
            <p class="lead table-title">BANK</p>
            <p class="table-sub">A summary of your finances is shown here.</p>
            <hr class="bg-light">
            <BankTable 
              :positions='positions' 
              :stocks='stocks' 
              :bank="bank" 
              :bankComputed="bankComputed"
            />
          </div>
          <div id="positions">
            <p class="lead table-title">POSITIONS</p>
            <p class="table-sub">A summary of your positions is shown here.</p>
            <hr class="bg-light">
          </div>
          <PositionsTable 
            :positions='positions' 
            :stocks='stocks'
          />
          <PositionsTable 
            v-if='pastPositions.length > 0'
            :pastPositions='pastPositions' 
            :past='true'
          />
        </div>
      </div>
      <div class="content">
        <div id="nav-container" ref="navContainer" fixed="top">
          <b-navbar id="nav" class="d-flex align-items-start">
            <div id="options" ref="options" class="col-2 bg-dark text-light">
              <p ref="optionsTitle">OPTIONS</p>
              <ToggleButton
                @toggled="toggleInsane"
                ref="toggleInsane"
                class="option-button"
                :class="insaneClass"
                onText="Insane mode"
                offText="Boring mode"
              />
            </div>
            <div class="col-8 terminal d-flex align-items-center">
              <div id="log-container" class="bg-dark text-light">
                  <Log 
                    id="log" 
                    ref="log" 
                    class="text-light"
                    @ready="handleLogReady"
                  />
              </div>
            </div>
            <div id="title-box" class="col-2">
              <div id="main-title" ref="main-title" :class="insaneClass">MARKT</div>
              <span class="break-here"></span>
              <div id="markt-subtitle" ref="main-subtitle" class="lead" v-show="!insane">by <a href="https://kylegrimsrudma.nz">Kyle</a></div>
              <div class="clock-container d-flex align-items-end">
                <Clock 
                  id="clock" 
                  ref="clock" 
                  :class="insaneClass"
                />
              </div>
            </div>
          </b-navbar>
        </div>
        <div class="stocks-grid">
          <StockCard 
            v-for="(stock, ticker) in stocks" 
            class="stock-card" 
            :key="ticker" 
            :bank="bank"
            :stock="stock" 
            :position="positions[ticker]" 
            :insane="insane" 
            @buy="buyPosition" 
            @sell="sellPosition" 
            @toast="toast"
          />
          <DummyCard 
            id="dummy" 
            ref="dummy" 
            class="bg-light text-dark" 
            :class="insaneClass" 
            :key="dummyRedrawFlag" 
            :prompt="dummyPrompt" 
            :market="market"
            @promptDismissed="dummyPromptDismissed = true"
            @submitted="createStockCard"
          />            
        </div>
      </div>
    </div>
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
import { generateStockList } from '../js/stocks'
const { initializeStock } = require('@/js/stocks.js')
const { log } = require('@/js/log.js')

const DEFAULT_INITIAL_CASH = 5000

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
      logReady:false,
      preMountMessages: [],
      market:[],
      loading: true,
      positions: {},
      pastPositions: [],
      stocks: {},
      insane: false,
      bank: {            
        cash:DEFAULT_INITIAL_CASH,
        invested:0,
        totalDeposited:DEFAULT_INITIAL_CASH,
        trades:0
      },
      modals: {},
      dummyPrompt: false,
      dummyPromptDismissed: false,
      dummyRedrawFlag: false
    }
  },
  watch: {
    stocks: {
      deep: true,
      handler() {
        for (let ticker in this.positions) {
          let p = this.positions[ticker]
          let diff = this.stocks[ticker].price.current - p.initPrice
          p.net = diff * p.quantity
          let result
          if (diff >= 0) {
            result = "+ $" + parseFloat(p.net).toFixed(2)
          }
          else {
            result = "- $" + parseFloat(-1 * p.net).toFixed(2)
          }
          p.netString = result
        }
      }
    },
    dummyPromptDismissed() {
      this.dummyPrompt = false
    }
  },
  computed: {
    insaneClass() {
      return this.insane? 'insane' : ''
    },
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
    bankComputed() {
      let balance = this.bank.cash + this.bank.invested
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
  created() {
    this.getMarketSnapshot()
  },
  mounted() {
    window.addEventListener('load', () => {
      this.loading = false
      if (this.screenSize != 'mobile') {
        this.createModal('WELCOME', "Try your hand at day trading risk-free.\n\nMarket data is retrieved using <a href=https://github.com/vxsl/bnnbloomberg-markets-api>my unofficial Javascript wrapper for BNN Bloomberg's market data API</a>. If you find the real stock market boring, you can try disabling boring mode...\n\n<span style='float:right'><span style='font-style:italic'>Have fun!</span> 📈</span>")
      }
      else {
        this.createModal('WELCOME', "Unfortunately this webapp has not yet been optimized for mobile use. Please visit again on a larger display.", false)
      }
    })
  },
  methods: {
    handleLogReady() {
      this.logReady = true
      for (let message of this.preMountMessages) {
        log(message)
      }
    },
    preLog(message) {
      this.logReady? log(message) : this.preMountMessages.push(message)
    },
    async getMarketSnapshot() {
      this.preLog('Retrieving stock list')
      this.preLog('...')
      await new Promise(r => setTimeout(r, 1000));
      this.market = await fetch('https://kylegrimsrudma.nz:8081/https://markt.kylegrimsrudma.nz/static/freshest', {method: 'get'}).then(async (res) => {
        if (res.status != 200) throw Error
        let obj = await res.json()
        this.preLog('Stock list retrieved successfully.')
        this.preLog(obj.stocks.length + ' stocks listed on ' + obj.exchanges + ' as of ' + new Date(parseInt(obj.timestamp)).toString())
        return obj.stocks
      }).catch(async (err) => {
        this.preLog('Error obtaining stock list', 'Trying to generate from scratch.')
        try {
          this.preLog('Success', 'Stock list successfully generated.')
          return await generateStockList()
        }
        catch (e) {
          this.preLog('Error generating stock list - ' + e)
          this.toast('Error generating stock list', e, false)
          return []
        }
      });
    },
    createModal(title, message, closeable=true) {
      this.$set(this.modals, title, 
        {
          message:message,
          closeable:closeable
        })
    },
    destroyModal(title) {
      this.$delete(this.modals, title)
      if (title == 'WELCOME') {
        window.scrollTo(0,0)
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
    async createStockCard(input) {
      if (!this.stocks[input]) {
        try {
          let newStock = await initializeStock(input)
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
        this.toast('Nice!', 'Click on a stock to initiate a position.')
      }
    },
    buyPosition(ticker, quantity) {
      let salePrice = this.stocks[ticker].price.current
      let amount = salePrice * quantity
      this.toast(ticker, 'Purchased ' + quantity + " " + ticker + " stock" + (quantity > 1? "s" : '') + " for $" + parseFloat(amount).toFixed(2) + " total.")
      this.$set(this.positions, ticker, 
        {
          'quantity':quantity,
          'initPrice':salePrice,
          'net':0,
          'netString':'+ $0.00',
          'timestamp':Date.now(),
          'ticker':ticker
        }
      )
      this.bank.cash -= amount
      this.bank.invested += amount
      this.bank.trades += 1
    },
    sellPosition(ticker) {
      let soldPrice = this.stocks[ticker].price.current
      let initPrice = this.stocks[ticker].price.average
      let quantity = this.positions[ticker].quantity
      let amount = soldPrice * quantity
      this.bank.cash += amount
      this.bank.invested -= (this.positions[ticker].initPrice * quantity)
      this.pastPositions.unshift(this.positions[ticker])
      this.$delete(this.positions, ticker)
      this.bank.trades += 1
      let messagePrefix = 'You just sold ' + quantity + " " + ticker + " stock" + (quantity > 1? "s" : '')
      if (soldPrice > initPrice) {
        this.toast('Nice trade!', messagePrefix + " for a net profit of $" + parseFloat((soldPrice - initPrice) * quantity).toFixed(2) + ".")
      }
      else if (soldPrice == initPrice) {
        if (quantity > 1) {
          this.toast(ticker, messagePrefix + " for the same price at which they were purchased.")
        }
        else {
          this.toast(ticker, messagePrefix + " for the same price at which it was purchased.")
        }
      }
      else if (soldPrice < initPrice) {
        this.toast('Ouch...', messagePrefix + " for a net loss of -$" + parseFloat((initPrice - soldPrice) * quantity).toFixed(2) + ".")
      }
    },
    toggleInsane() {
      this.$bvToast.hide('Market closed')
      this.insane = !this.insane;
      this.$emit('insane', this.insane)
    }
  }
}
</script>

<style lang="scss">
@import '@/scss/custom.scss';
@import '@/scss/animations.scss';

#main-title {
  animation: none; 
  -webkit-animation: none;
  &.insane {
    animation: colorchange 0.5s ease 0.5s infinite; 
    -webkit-animation: colorchange 0.5s ease 0s infinite alternate;
  }
}

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
    overflow:hidden;
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

  .stock-card {
    width:20%;
  }
  #dummy {
    transition: filter 1.5s;
    &.insane {
      filter:invert(100%)
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
  user-select:none;
  margin-bottom:1em;
  #title-box {
    height:20vh;
    text-align:right;
    padding-top:1%;
    padding-right:3%;
    #main-title {
      direction: rtl;
      font-size:2em;
      font-family:Rubik;
      font-weight:100;
    }
    #markt-subtitle {
      display:block;
      padding-right:5%;
    }
    .clock-container {
      position:absolute;
      top:0;
      height:100%;
      #clock {
        transition:color 0.5s;
        user-select:none;
        margin-bottom:0;
        &.insane {
          color:$light-color
        }
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
        -webkit-animation-iteration-count: infinite;
        animation-iteration-count: infinite;
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
