<template>
  <p class="clock">{{time}}</p>
</template>

<script>
export default {
  data() {
    return {
      time: String
    };
  },
  async created() { 
    let d, millis, n
    for (;;) {
        d = new Date()
        millis = d.getMilliseconds().toString()
        n = 3 - millis.length
        for (let i = 0; i < n; i++) {
            millis += "0"
        }
        this.time = d.toLocaleTimeString().replace(" AM", ":"+millis+" AM").replace(" PM", ":"+millis +" PM")
        await new Promise(r => setTimeout(r, 10));
    }
  },
};
</script>

<style lang="scss">
</style>