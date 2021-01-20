<template>
    <div class="d-flex justify-content-center align-items-center">
      <autocomplete
          class="ticker-input"
          ref="tickerInput"
          placeholder="Search..."
          :search="search"
          @submit="passInput"
          @blur="$emit('blur')"
      >
      <template #result="{ result, props }">
        <li
          v-bind="props"
          class="autocomplete-result"
        >
          <div class="result">
            {{ result.symbol }}
          </div>
          <div class="result-details" v-html="result.name" />
        </li>
      </template>
      </autocomplete>
    </div>
</template>

<script>
import Autocomplete from '@trevoreyre/autocomplete-vue'
import knownSymbols from '@/js/knownSymbols.json'

export default {
  data() {
      return {
        symbols: [],
      }
  },
  props: {
    market:Array
  },
  components: {
      Autocomplete
  },
  mounted() {
    let input = this.$refs.tickerInput.$el.children[0].children[0]
    input.focus()
    input.select()
    this.symbols = knownSymbols.ca.concat(knownSymbols.nasdaq)
  },
  methods: {
      search(input) {
        if (this.market.length) {
          return this.market.filter(stock => {
            input = input.toUpperCase()
            return stock.symbol.startsWith(input) || stock.name.startsWith(input)
          })
        }
        else {
          return ['Retrieving market data from BNN Bloomberg...']
        }
      },
      async passInput(input) {
        if (input === undefined) {
          if (this.$refs.tickerInput.value === undefined) {
            return
          }
          else {
            input = this.$refs.tickerInput.value
          }
        }
        if (input.symbol) {
          input = input.symbol
        }
        this.$emit('submit', input)
      },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/scss/custom.scss';
  .result-details {
    font-size:0.8em;
    color:$light-grey-color
  }
  .ticker-input {
    position:absolute;
    width:80%;
    align-self:center;
  }
</style>
