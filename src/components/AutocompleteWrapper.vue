<template>
    <autocomplete
        class="ticker-input"
        ref="tickerInput"
        :search="search"
        @submit="passInput"
    ></autocomplete>
</template>

<script>
import Autocomplete from '@trevoreyre/autocomplete-vue'
import knownSymbols from '@/js/data/knownSymbols.json'

export default {
  data() {
      return {
      }
  },
  props: {
  },
  components: {
      Autocomplete
  },
  mounted() {
    let input = this.$refs.tickerInput.$el.children[0].children[0]
    input.focus()
    input.select()
  },
  methods: {
      search(input) {
        return knownSymbols.ca.filter(symbol => {
            return symbol.label.startsWith(input.toUpperCase())
        }).map(a => a.label)
      },
      async passInput(input) {
        if (input === undefined) {
          return
        }
        this.$emit('submit', input)
      },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
