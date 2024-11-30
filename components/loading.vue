<template>
  <div class="loading-overlay">
    <img src="/favicon.svg" alt="logo" class="logo" />
    <div class="loading">
      <div class="loading-bar"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Loading",
};
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
}

.logo {
  width: 120px;
  margin-bottom: 50px;
}

.loading {
  position: absolute;
  bottom: 100px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.loading-bar {
  width: 170px;
  height: 5px;
  background: #484848;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
}

.loading-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: #fff;
  animation: loading 3s infinite ease-in-out;
}

@keyframes loading {
  0% {
    left: -100%;
  }
  25% {
    left: 0;
  }
  50% {
    left: 0;
  }
  75% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}
</style>
