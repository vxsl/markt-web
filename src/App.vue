<template>
  <div id="app" class="bg-light">
      <div id="nav-container" fixed="top">
        <b-navbar id="nav">
          <b-navbar-nav class="ml-auto" id="right-items">
            <div id="markt-title" class="display-4">MARKT</div>
            <div id="markt-subtitle" class="lead">made by <a href="https://kylegrimsrudma.nz">Kyle</a></div>
          </b-navbar-nav>
        </b-navbar>
      </div>
    <router-view/>
  </div>
</template>

<style lang="scss">
@import '../scss/custom.scss';
@import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@200;300;400;500;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,100;0,200;0,300;1,300&display=swap');



#app {
  font-family: Inconsolata, Courier, monospace;
  letter-spacing:0.001em;
  transition: background 1s;
}
#right-items {
  display:block;
  float:right;
  text-align:right;
  font-weight:700;
}
#nav-container {
  position:absolute;
  z-index:4;
  width:100%;
  padding-top:1.2em;
  padding-bottom:1.2em;
  padding-right:16%;
  user-select:none;
  #markt-title {
    font-family:Rubik;
    font-weight:100;
  }
  #markt-subtitle {
    margin-right:5%;
  }
}

.nav-link {
  color:theme-color("primary") !important;
}

a:hover {
  font-weight:700;
}
</style>
