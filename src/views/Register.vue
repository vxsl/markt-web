<template>
  <div id="page" class="d-flex align-items-center">
    <b-container>
      <CreateAccount/>
    </b-container>
  </div>
</template>

<script>
import CreateAccount from '@/components/CreateAccount.vue'

export default {
  components: {
    CreateAccount
  }
}
</script>

<style lang="scss">
  #page {
    padding:3em;
  }
</style>