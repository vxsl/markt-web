<template>
  <div class="d-flex align-items-center">
    <input @click="toggle" ref="toggle" id="toggle" class="tgl" type="checkbox" />
    <label class="tgl-btn" :data-tg-off="offText" :data-tg-on="onText" for="toggle"/>
  </div>
</template>

<script>
export default {
    props: {
        onText: String,
        offText: String,
    },
    methods: {
        toggle() {
          this.$emit('toggled')
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/scss/custom.scss";

/* Loosely adapted from @mallendeo's codepen:
https://codepen.io/mallendeo/pen/eLIiG */

.tgl {
  display: none;
  &,
  &:after,
  &:before,
  & *,
  & *:after,
  & *:before,
  & + .tgl-btn {
    box-sizing: border-box;
    &::selection {
      background: none;
    }
  }

  + .tgl-btn {
    padding:2%;
    position: relative;
    cursor: pointer;
    user-select: none;
    &:after,
    &:before {
      position: relative;
      display: block;
      content: "";
      height: 100%;
    }

    &:after {
      opacity:1;
    }

    &:before {
      display: none;
    }
  }

  &:checked + .tgl-btn:after {
    opacity:0.5;
  }

  + .tgl-btn {
    overflow: hidden;
    border-radius:0.5em;
    border:solid;
    border-width:1px;
    border-color:$dark-color;
    backface-visibility: hidden;
    transition: all 0.2s ease;
    background: transparent;
    &:after,
    &:before {
      display: inline-block;
      transition: all 0.2s ease;
      text-align: center;
    }

    &:after {
      opacity:0;
      display:none;
      content: attr(data-tg-on);
    }

    &:before {
    display:block;
      opacity:1;
      content: attr(data-tg-off);

    }

    &:active {
      background: #888;
      &:before {
        opacity:0.5;
      }
    }
  }

  &:checked + .tgl-btn {
    background:$primary-color;
    color:$light-color;
    &:before {
        display:none;
      opacity:0;
    }

    &:after {
        display:block;
      opacity:1;
    }

    &:active:after {
      opacity:0.5;
    }
  }
}

</style>