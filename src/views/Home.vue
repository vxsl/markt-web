<template>
  <b-container>
    <b-row>             
        <b-col class="col-4">
            <div class="chartTable-sidebar">
                <div id="logContainer">
                    <pre id="log"></pre>
                    <pre id="refreshLog"></pre>
                    <pre id="clock">XX:XX:XX:XXX XX</pre>
                </div>
                <table id="positionsData"></table>
            </div>
        </b-col>
        <b-col class="col-8 chartTable" id="positionsTable"> </b-col>
    </b-row>
  </b-container>
</template>
<!--
<script src="js/logs.js"></script>
<script src="js/app/app.js"></script>
<script src="js/app/appLink.js"></script>
<script src="js/data/knownSymbols.js"></script>

<script src="js/charts/chartsConfig.js"></script>
<script src="js/charts/charts.js"></script>

<script src="js/terminal.js"></script>
-->
<script>
// @ is an alias to /src

export default {
  name: 'Home',
  components: {
  },
  data() {
        return {
        }
    },
}
</script>

<style lang="scss">
</style>
