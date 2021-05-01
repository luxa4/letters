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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
