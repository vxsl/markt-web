<template>
  <div class="chart-outer-container">
    <div ref="overlay" id="dummy-overlay" :style="loading? 'cursor:wait' : 'cursor:pointer'" @click="handleClick">
      <p ref="plus" id="plus" v-if="waiting && !prompt">+</p>
      <p id="prompt" v-if="prompt">Click here to select your first stock.</p>
      <div v-else class="autocomplete-container">
        <AutocompleteWrapper
          v-if="selecting"
          ref="autocomplete"
          :market="market"
          @submit="handleSubmit"
          @blur="handleAutocompleteBlur"
        >
        </AutocompleteWrapper>
        <div v-else-if="loading" class="loading" ref="loading">
          <p>Contacting BNN Bloomberg server...</p>
          <div 
            class="spinner-border" 
            role="status"
            />
          </div>
      </div>
    </div>
    <div class="chart-container">
      <div class="chart-extlabel">
        <h2>&#10240; &#x2800;</h2>
      </div>
      <DummyChart/>
    </div>
    <div class="chart-footer">
        <table class="table w-100" ref="footerTable">
            <tbody>
                <tr>
                    <th></th>
                    <td></td>
                </tr>
            </tbody>
        </table>
      </div>
  </div>
</template>

<script>
import DummyChart from '@/components/DummyChart.vue'
import AutocompleteWrapper from '@/components/AutocompleteWrapper.vue'

export default {
  data() {
      return {
        waiting:Boolean,
        selecting:Boolean,
        loading:Boolean,
        noBlur:Boolean
      }
  },
  props: {
    market: Array,
    ticker: String,   
    prompt: Boolean
  },
  components: {
      DummyChart,
      AutocompleteWrapper
  },
  mounted() {
    this.waiting = true
    this.selecting = false
    this.loading = false
    this.noBlur = false
  },
  methods: {
    handleAutocompleteBlur() {
      if (!this.noBlur) {
        this.waiting = true
        this.selecting = false
        this.loading = false
      }
    },
    handleSubmit(input) {
      this.noBlur = true
      this.waiting = false
      this.selecting = false
      this.loading = true
      this.$emit('submitted', input)
    },
    handleClick() {
      this.$emit('promptDismissed')
      this.loading? null : this.selecting = true
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "@/scss/custom.scss";
@import "../scss/autocomplete-custom.css";

.loading {
  display:block;
  text-align:center;
  max-width:100%;
  overflow:hidden;
  * {
    position:relative !important;
  }
  p {
    font-size:1em !important;
    margin-bottom:0;
  }
  div {
    margin-top:20%;
  }
}

.chart-outer-container {
  position:relative;
  width:20%;
  margin:1em;
  user-select:none;
  .chart-container{
      padding:1em;

    filter: blur(0.2em);    
    border:none !important;
    overflow:hidden;
    height:100%;
    padding:1em;
    padding-top:0.5em;
    padding-bottom:0.5em;
    .chart-extlabel {
      width:100%;
      color:$dark-color;
      padding-bottom:1%;
      margin-bottom:0.6em;
      text-align:right;
      border-bottom:solid;
      border-bottom-width:1px;
      h2 {
        white-space:pre !important;
        font-size:1.3vw;
        vertical-align:middle;
        margin:0;
      }
    }
  }
}

.chart-footer {
  visibility: hidden;
}

#dummy-overlay {
  user-select:none;
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  #plus {
    user-select: none;
    display: block !important;
    color: $dark-color;
    position: absolute;
    font-size: 5em;
    margin-bottom:0 !important;
  }

  #prompt {
    position:absolute;
    margin:1em;
    text-align:center;
    font-weight:700;
  }


  .autocomplete-container {
    padding: 1em;
    max-width:100%;
  }
}
</style>
