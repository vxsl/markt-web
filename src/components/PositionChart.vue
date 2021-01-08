<script>
import { Line } from 'vue-chartjs'
import '@taeuk-gang/chartjs-plugin-streaming';

export default {
  name: 'PositionChart',
  extends: Line,
  mounted () {
    this.renderChart({
      datasets: [{
        data: []
      }, {
        data: []
      }]
    }, {
      scales: {
        xAxes: [{
          type: 'realtime'
        }]
      }
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
