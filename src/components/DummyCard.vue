<template>
  <div class="chart-outer-container">
    <div ref="overlay" id="dummy-overlay" @click="initStock">
      <p ref="plus" v-show="!selecting">+</p>
      <div class="autocomplete-container">
        <AutocompleteWrapper
          v-if="selecting"
          @submit="createPosition"
          @quit="selecting = false"
          @loading="startLoading"
        >
        </AutocompleteWrapper>
        <div class="loading" ref="loading">
          <p>Contacting BNN server...</p>
          <div 
            class="spinner-border" 
            role="status"
            />
          </div>
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
          link: appLink,
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
          let newStock = await appLink.createPosition(input)
          this.$emit('newStock', newStock)
          this.selecting = false
        }
        catch {
          // handle error (get message?)
          alert('There was an error creating that position.')
        }
      },
      initStock() {
        this.selecting = true;

      },
      startLoading() {
        this.$refs.overlay.style.cursor = 'wait'
        this.$refs.loading.style.display = 'block'
        this.$refs.plus.style.opacity = '0'
      },
      stopLoading() {
        this.$refs.overlay.style.cursor = 'pointer'
        this.$refs.loading.style.display = 'none'
        this.$refs.plus.style.opacity = '1'
      },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "@/scss/custom.scss";
@import "../scss/autocomplete-custom.css";

.loading {
  display:none;
  text-align:center;
  max-width:100%;
  overflow:hidden;
  * {
    position:relative !important;
  }
  p {
    font-size:1em !important;
  }
  div {
    margin-top:20%;
  }
}
.chart-container {
  filter: blur(0.2em);    
  border:none !important
}

#dummy-overlay {
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
    color: $dark-color;
    position: absolute;
    font-size: 5em;
    margin-bottom:0 !important;
  }


  .autocomplete-container {
    padding: 1em;
    max-width:100%;
  }
}
</style>
