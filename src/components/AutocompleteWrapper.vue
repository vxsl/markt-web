<template>
    <div class="d-flex justify-content-center align-items-center">
      <autocomplete
          class="ticker-input"
          ref="tickerInput"
          placeholder="Search..."
          :search="search"
          @submit="passInput"
          @blur="$emit('blur')"
      ></autocomplete>
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
        return this.symbols.filter(symbol => {
            return symbol.label.startsWith(input.toUpperCase())
        }).map(a => a.label)
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
        this.$emit('submit', input.toUpperCase())
      },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .ticker-input {
    position:absolute;
    width:80%;
    align-self:center;
  }
</style>
