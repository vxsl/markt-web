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
const { messageEmitter } = require('@/js/log.js')
const { harvesterMessageEmitter } = require('@/js/bnnbloomberg-markets-api/QuoteHarvester.js') 

export default {
  data() {
    return {
      messages: []
    };
  },
  created() { 
    messageEmitter.on('new', this.addMessage)
    harvesterMessageEmitter.on('new', this.addMessage)
    this.$emit('ready')
  },
  methods: {
    addMessage(message) {
      this.messages.push(message)
      if (this.messages.length > 50) {
        this.messages.shift()
      }
    }
  }
};
</script>

<style lang="scss">

.log-container {

  position: absolute;
  top: calc(20vh - 1em);
  width: calc(100% - 2em);
  height:0;
  left:1em;
  user-select:none;
  .log-lines {
    font-size:0.9em;
    word-wrap:break-word !important;
    display:inline-block !important;
    width:100%;
    position: absolute;
    bottom:0;
    p {
      margin-bottom:0;
    }
  }
}

</style>