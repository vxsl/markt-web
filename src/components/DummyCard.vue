<template>
  <div class="chart-container-container">
    <div ref="overlay" id="dummy_chart_overlay" @click="initPosition">
      <p ref="plus" v-show="!selecting">+</p>
      <div class="autocomplete-container">
        <AutocompleteWrapper
          v-if="selecting"
          @submit="createPosition"
          @quit="selecting = false"
          @loading="startLoading"
        >
        </AutocompleteWrapper>
        <div 
          class="spinner-border" 
          role="status"
          ref="spinner"/>
        </div>
    </div>
    <div class="chart-container">
      <div class="chart-extlabel">
        <h2>N/A</h2>
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
          selecting: false,
          selected: false
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

      },
      startLoading() {
        this.$refs.overlay.style.cursor = 'wait'
        this.$refs.spinner.style.display = 'block'
        this.$refs.plus.style.opacity = '0'
      },
      stopLoading() {
        this.$refs.overlay.style.cursor = 'pointer'
        this.$refs.spinner.style.display = 'none'
        this.$refs.plus.style.opacity = '1'
      },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "../scss/autocomplete-custom.css";

.spinner-border {
  display:none
}
.chart-container {
  filter: blur(0.2em);    
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
