<template>
    <div class="chart-container-container">
        <div class="chart-container">
            <div class="chart-extlabel">
                <h2>{{ticker}}</h2>
            </div>
            <!-- <canvas></canvas> -->
            <PositionChart/>
        </div>
    </div>
</template>

<script>
import PositionChart from '@/components/PositionChart.vue'

export default {
  props: {
    ticker: String,    
  },
  components: {
      PositionChart
  },
  created() {
      this.$emit('newPositionCard', this)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
