<template>
  <div id="app">
    <CreateLetter />
  </div>
</template>

<script>
import CreateLetter from './components/CreateLetter.vue'

export default {
  name: 'App',
  components: {
    CreateLetter
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat&display=swap');
#app {
  font-family: 'Montserrat', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 14px;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
