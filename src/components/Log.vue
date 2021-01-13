<template>
  <div class="wrapper">
    <div class="log-container">
      <div class="log-lines">
        <p v-for="msg in messages">{{msg}}</p>
      </div>
    </div>
  </div>
</template>

<script>
const { logEmitter } = require('@/js/log.js')
export default {
  data() {
    return {
      messages: ['Welcome to Markt! Try buying and selling some stocks.', '\n', "Market data is retrieved from BNN Bloomberg's realtime API. If you find the real stock market boring, give insane mode a try."]
    };
  },
  async created() { 
    /* var i = 0;
    logEmitter.on('new', (message) => {
      this.messages.unshift(message)
      if (this.messages.length > 50) {
        this.messages.pop()
      }
    }) */

    var i = 0;
    logEmitter.on('new', (message) => {
      this.messages.push(message)
      if (this.messages.length > 50) {
        this.messages.shift()
      }
    })
  },
};
</script>

<style lang="scss">

/* .log-container {
  padding:1em;
  overflow:hidden;
  user-select:text;
  position:absolute;
  bottom:55vh;
  margin:0;
  .log-line {
    white-space:pre-wrap;
    margin:0 !important;
  }
} */

.log-container {

  position: absolute;
  top: calc(20vh - 1em);
  width: calc(100% - 5vh);
  height:0;
  .log-lines {
    word-wrap:break-word !important;
  display:inline-block !important;

    width:100%;
    position: absolute;
    bottom:0;
  }
}

</style>