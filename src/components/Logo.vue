<template>
  <div class="logo">
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
.logo {
  display: flex;
  justify-content: center;
  align-content: center;
  padding-bottom: 150px;
}

.btnSec {
  position: absolute;
  height: 10px;
  width: 10px;
  top: 257px;
  right: 142px;
  border-radius: 10px;
}
</style>
