<template>
  <div class="container">
    <div style="width: 400px; height: 400px; position: relative">
    <img width="400" height="400" src="../assets/img/10.png" alt="">
    <div @click="$emit('onShowControls')" class="btnSec"/>
    </div>
  </div>
</template>

<script>
export default {
name: 'Logo'
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-content: center;
}

.btnSec {
  position: absolute;
  height: 10px;
  width: 10px;
  top: 252px;
  right: 146px;
  border-radius: 10px;
}
</style>
