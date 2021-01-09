<template>
  <div id="page" class="d-flex align-items-center">
    <b-container>
      <Login/>
    </b-container>
  </div>
</template>

<script>
import Login from '@/components/Login.vue'

export default {
  components: {
    Login
  }
}
</script>

<style lang="scss">
  #page {
    padding:3em;
  }
</style>