<template>
  <div id="app" ref="app">
    <router-view @insane="toggleBodyInsaneClass"/>
  </div>
</template>

<script>
export default {
  data() {
    return {
    }
  },
  methods: {
    toggleBodyInsaneClass(insane) {
      insane? document.body.classList.add('insane') : document.body.classList.remove('insane')
    },
  },
}
</script>

<style lang="scss">
@import '@/scss/custom.scss';

body {
  width:100%;
  min-height:100vh;
  transition: background 1s;
  background:$light-color;
  &.insane {
    background:$dark-color;
  }
}

#app {
  font-family: Inconsolata, Courier, monospace;
  min-width:100vw;
  letter-spacing:0.001em;
  min-height:100vh;
  background:transparent !important;
}


</style>
