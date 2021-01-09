<template>
  <div ref="test" class="chart-container-container">
    <div id="dummy_chart_overlay" @click="initPosition">
      <p ref="plus" v-show="!selecting">+</p>
      <div class="autocomplete-container">
        <AutocompleteWrapper
          v-if="selecting"
          @submit="createPosition"
        >
        </AutocompleteWrapper>
      </div>
    </div>
    <div class="chart-container">
      <div class="chart-extlabel">
        <h2>&nbsp;</h2>
      </div>
      <DummyChart />
    </div>
  </div>
</template>

<script>
import DummyChart from '@/components/DummyChart.vue'
import AutocompleteWrapper from '@/components/AutocompleteWrapper.vue'
const appLink = require('@/js/app/appLink.js')

export default {
  data() {
      return {
          selecting: false
      }
  },
  props: {
    ticker: String,    
  },
  components: {
      DummyChart,
      AutocompleteWrapper
  },
  mounted() {
  },
  methods: {
      async createPosition(input) {
        try {
          console.log("creating with " + input)
          let newPosition = await appLink.createPosition(input)
          this.$emit('newPosition', newPosition)
          this.selecting = false
        }
        catch {
          // handle error (get message?)
          alert('There was an error creating that position.')
        }
      },
      initPosition() {
        this.selecting = true;

      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "../scss/autocomplete-custom.css";

.chart-container {
  filter: blur(0.3em);    
  border:none !important
}

#dummy_chart_overlay {
  user-select:none;
  position: absolute;
  z-index: 2;
  border:solid;
  border-width:1px;

  border-radius: 1em;
  /* border:solid;
  border-width:1px; */
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  p {
    user-select: none;
    display: block !important;
    color: rgb(61, 61, 61);
    position: absolute;
    font-size: 600%;
    margin-bottom:0 !important;
  }
  .ticker-input {
  }

  .autocomplete-container {
    padding: 1em;
  }
}
</style>
