<template>
  <b-container>
    <button type="button" class="btn btn-primary" @click="addPosition()">Do something</button>
    <b-row>             
        <!--<b-col class="col-4">
            <div class="chartTable-sidebar">
                <div id="logContainer">
                    <pre id="log"></pre>
                    <pre id="refreshLog"></pre>
                    <pre id="clock">XX:XX:XX:XXX XX</pre>
                </div>
                <table id="positionsData"></table>
            </div>
        </b-col>-->
        <b-col class="col-6"></b-col>
        <b-col class="col-6 chartTable" id="positionsTable">            
          <PositionCard v-for="position in positions" :key="position.ticker" :ticker="position.ticker"/>
        </b-col>
    </b-row>
  </b-container>
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
require('@/js/data/knownSymbols.js')


import PositionCard from '@/components/PositionCard.vue'

export default {

  name: 'Home',
  components: {
    PositionCard
  },
  data() {
        return {
          positions: [],
          examples: []
        }
    },
  mounted() {
  },
  methods: {
    async addPosition() {
      var obj = await appLink.createPosition('SHOP:CT')
      console.dir(obj)
      this.positions.push(obj)
      console.dir(this)
    }
  }
}
</script>

<style lang="scss">

.chartTable {
    border:solid;
    border-color:blue;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    position:relative;
}

canvas {
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    width:100%;
}
.chart-container-container {
    position:relative;
    width:20%;
    margin:1em
}
.chart-container{
    overflow:hidden;
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
    margin-bottom:10%;
    padding-bottom:1%;
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

PositionCard {
  border:solid;
  border-color:red;
}
</style>
