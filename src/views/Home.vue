<template>
  <div id="page">
    <div class="sidebar bg-dark text-light">
      <div id="logContainer">
          <Log id="log" ref="log"/>
          <Clock/>
      </div>
      <div class="sidebar-padded">
        <table id="positionsData" class="table table-dark">
          <thead>
            <tr>
              <th></th>
              <th>Current</th>
              <th>Max</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="position in positions" :key="position.ticker">
                <td>{{position.ticker}}</td>
                <td>{{parseFloat(position.price.current).toFixed(2)}}</td>
                <td>{{parseFloat(position.price.max).toFixed(2)}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="chartTable module" id="positionsTable">
      <PositionCard v-for="position in positions" :key="position.ticker" :ticker="position.ticker" :position="position" @newPositionCard="newPositionCard"/>
      <DummyCard ref="dummy" @newPosition="newPosition"/>            
    </div>
  </div>
</template>

<!--
/* require('@/js/charts/chartsConfig.js')
require('@/js/charts/charts.js') */
<script src="js/logs.js"></script>
<script src="js/terminal.js"></script>
-->
<script>
//require('@/js/app/app.js')
const appLink = require('@/js/app/appLink.js')
//require('@/js/data/knownSymbols.js')

import Log from '@/components/Log.vue'
import Clock from '@/components/Clock.vue'
import PositionCard from '@/components/PositionCard.vue'
import DummyCard from '@/components/DummyCard.vue'

export default {

  name: 'Home',
  components: {
    PositionCard,
    DummyCard,
    Log,
    Clock
  },
  data() {
        return {
          positions: [],
          examples: []
        }
    },
  mounted() {
    console.dir(this)
    console.log(this.$refs.log.stream === this.$refs.dummy.link.logEmitter)
    console.dir(this.$refs.dummy.link.logEmitter)
  },
  methods: {
    newPosition(position) {
      this.positions.push(position)
      this.$refs.dummy.stopLoading()
      //this.$emit(position)
    },
    newPositionCard(card) {
      console.dir(card)
    }
  }
}
</script>

<style lang="scss">
@import '@/scss/custom.scss';


.sidebar {
  user-select:none;
  position:absolute;
  top:0;
  left:0;
  width:30%;
  height:100vh !important;
  border-right:solid;
  border-right-width:1px;
  #log {
    max-height:40vh;
    padding-left:0;
    margin:0.2em;
  }
  #logContainer {
    user-select:text;
    padding-left:4%;
    border:solid;
    border-left:none;
    border-top-right-radius:1em;
    border-bottom-right-radius:1em;
    border-width: 1px;
    margin:2em;
    margin-left:0;
  }
  .sidebar-padded {
    padding:1em;
    table {
      width:100%;
      border-collapse: collapse;
      tr, td {
        text-align:left;
        vertical-align:middle
      }
    }
  }
}


#logContainer > pre * {    
    white-space:pre-wrap;
    font-size:.8vw;
    word-wrap: break-word;
}

#page {
}
.module {
  border:solid;
  border-width:1px;
  border-color:rgb(219, 219, 219);
  border-radius:1em;
  height:100%;
}
.chartTable {
  float:right;
  width:66%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  position:relative;
}

canvas {
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
}
.chart-container-container {
    position:relative;
    width:20%;
    margin:1em;
    user-select:none;
}
.chart-container{
    overflow:hidden;
    height:100%;
    padding:1em;

    /*
    width: 500px;
    margin-left: 40px;
    margin-right: 40px;
    margin-bottom: 40px;*/
    /* box-sizing:border-box; */
    border:solid;
    border-color:rgb(61,61,61);
    border-width:1px;
    border-radius: 1em;
}

.chart-extlabel {
    width:100%;
    color:rgb(1,61,61);
    padding-bottom:1%;
    margin-bottom:0.6em;
    padding-top:1%;
    text-align:right;
    border-bottom:solid;
    border-bottom-width:1px
}
.chart-extlabel > h2 {
    font-size:1vw;
    vertical-align:middle;
    padding-right:10%;
    padding-top:2%;
    padding-bottom:1%;
    margin:0;
}

</style>
