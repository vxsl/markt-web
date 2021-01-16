<template>
  <div id="app" ref="app" :class="insaneClass" class="bg-light min-vh-100">
    <router-view @insane="toggleInsaneClass"/>
  </div>
</template>

<script>
export default {
  data() {
    return {
      insaneClass:String,
    }
  },
  methods: {
    toggleInsaneClass(insane) {
      insane? this.insaneClass = 'insane' : this.insaneClass = 'normal'
      this.toggleInsaneClassOnChildren(insane)
    },
    toggleInsaneClassOnChildren(insane) {
      for (let key in this.$children[0].$refs) {
        try {
          let el = this.$children[0].$refs[key]
          if (el._isVue) {
            el = el.$el
          }
          if (el.classList.contains('alter-on-insane')) {
            if (insane) {
              el.classList.add('insane')
            }
            else {
              el.classList.remove('insane')
            }
          }
          else if (el.classList.contains('light-text-on-insane')) {
            if (insane) {
              el.classList.add('text-light')
            }
            else {
              el.classList.remove('text-light')
            }
          }
          else if (el.classList.contains('invert-on-insane')) {
            if (insane) {
              el.style.filter = 'invert(100%)'
            }
            else {
              el.style.filter = ''
            }
          }
          else if (el.classList.contains('hide-on-insane')) {
            if (insane) {
              el.style.visibility = 'hidden'
            }
            else {
              el.style.visibility = 'visible'
            }
          }
        }
        catch (e) {
          console.log(e.message)
        }
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/scss/custom.scss';

#app {
  font-family: Inconsolata, Courier, monospace;
  min-width:100vw;
  letter-spacing:0.001em;
  transition: background 1s;
}

#app.insane {
  background:$dark-color !important;
}

.hide-on-insane {
  transition: visibility 0.5s
}
.light-text-on-insane {
  transition: color 1s
}
.invert-on-insane {
  transition: filter 2s
}
.alter-on-insane.insane {
  animation: colorchange 0.5s ease 0.5s infinite; 
  -webkit-animation: colorchange 0.5s ease 0s infinite alternate;
}
.alter-on-insane.normal {
  animation: none
}

@keyframes colorchange
{
  0%    {color: $light-color;}
  100%  {color: $dark-color;}
}

@-webkit-keyframes colorchange 
{
  0%    {color: $light-color;}
  100%  {color: $dark-color;}
}


</style>
