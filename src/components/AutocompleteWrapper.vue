<template>
    <div class="d-flex justify-content-center align-items-center">
      <autocomplete
          v-show="!done"
          class="ticker-input"
          ref="tickerInput"
          placeholder="Search..."
          :search="search"
          @submit="passInput"
          @blur="done? $emit('loading') : $emit('quit')"
      ></autocomplete>
    </div>
</template>

<script>
import Autocomplete from '@trevoreyre/autocomplete-vue'
import knownSymbols from '@/js/data/knownSymbols.json'

export default {
  data() {
      return {
        done:false
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
        this.done = true
        //this.$refs.spinner.style.display = 'block'
        this.$emit('submit', input)
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
