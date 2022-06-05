<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>

export default {
  name: 'App',
}
</script>

<style>
@import "~normalize.css";
@import url('https://fonts.googleapis.com/css2?family=Montserrat&display=swap');
* {
  outline: none;
}

#app {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Montserrat', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 14px;
  text-align: center;
  color: #2c3e50;
}
.btn {
  width: 320px;
}
</style>
