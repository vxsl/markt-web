<template>
  <div class="log-container">
    <p class="log-line" v-for="msg in messages" :key='msg'>{{msg}}</p>
  </div>
</template>

<script>
const { logEmitter } = require('@/js/log.js')
export default {
  data() {
    return {
      messages: [],
    };
  },
  async created() { 
    var i = 0;
    logEmitter.on('new', (message) => {
      this.messages.unshift(message)
      if (this.messages.length > 50) {
        this.messages.pop()
      }
    })
  },
};
</script>

<style lang="scss">

.log-container {
  padding:1em;
  max-height:100;
  overflow:hidden;
  user-select:text;
  .log-line {
    margin:0 !important;
  }
}

</style>