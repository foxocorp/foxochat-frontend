<template>
  <div>
    <div class="container">
      <img class="logo" src="/favicon.svg" alt="Foxogram logo">
      <div class="text">
        Foxogram
        <div class="countdown">
          <div class="countdown-item">
            <span>{{ countdown.days }}d</span>
          </div>
          <div class="countdown-item">
            <span>{{ countdown.hours }}h</span>
          </div>
          <div class="countdown-item">
            <span>{{ countdown.minutes }}m</span>
          </div>
          <div class="countdown-item">
            <span>{{ countdown.seconds }}s</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const countdown = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
});
let intervalId = null;

const updateCountdown = () => {
  const now = new Date();
  const nextYear = new Date(`January 1, ${now.getFullYear() + 1} 00:00:00`);
  const diff = nextYear - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  countdown.value = { days, hours, minutes, seconds };
};

onMounted(() => {
  updateCountdown();
  intervalId = setInterval(updateCountdown, 1000);
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});
</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.logo {
  width: 150px;
  height: 150px;
  margin-right: 30px;
}

.text {
  font-size: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.countdown {
  display: flex;
  gap: 10px;
  font-size: 40px;
  margin-top: 20px;
  color: #FF6347;
}

.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
