<template>
  <div>
     <div id="jumbo" ref="jumbo" class="jumbotron" align="center">
        <div>
          <h1 id="tplydestination" ref="tplydestination" class="display-4"></h1>
          <p class="lead">Welcome. I'm thinking of what to write in here...</p>
          <b-button to="/" variant="primary" class="btn-lg">Use as guest</b-button>
          <b-button to="/register" variant="info" class="btn-lg">Create account</b-button>
        </div>
        <div>
          <form class="login" @submit.prevent="login">
            <label>Email</label>  
            <input required v-model="email" type="email" placeholder="Name"/>
            <label>Password</label>
            <input required v-model="password" type="password" placeholder="Password"/>
            <hr/>
            <button type="submit">Login</button>
          </form>
        </div>
      </div>      
  </div>
</template>

<script>
  export default {
    data(){
      return {
        email : "",
        password : ""
      }
    },
    methods: {
      login() {
        let email = this.email
        let password = this.password
        this.$store.dispatch('login', { email, password })
       .then(() => this.$router.push('/'))
       .catch(err => console.log(err))
      }
    }
  }
</script>

<style lang="scss" scoped>
#jumbo {
  margin:1em;
  border-radius:1em;
  div {
    padding:0.5em;
    p {
      margin:1em;
    }
    form * {
      display:block
    }
  }
}
.btn-lg {
  margin:1em;
}
</style>