<template>
  <div class="error-page">
    <div class="content">
      <div class="hand">
        <img src="/svg/hand-error.svg" alt="404" />
      </div>
      <div class="text">
        <h1>{{ errorCode }}</h1>
        <p>
          Looks like you’re lost...<br />
          There’s no page for <span class="uri">{{ truncatedUri  }}</span>
        </p>
        <div class="buttons">
          <NuxtLink class="btn red" to="/">Return to Home</NuxtLink>
          <NuxtLink class="btn status-page" to="https://status.foxogram.su/">Status Page</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';
import { useRoute } from 'vue-router';

const route = useRoute();

const props = defineProps({
  error: {
    type: Object as () => NuxtError | undefined,
    required: false,
  },
});

const errorCode = props.error?.statusCode || '404';
const truncatedUri = route.path.length > 30 ? route.path.substring(0, 30) + '...' : route.path;
</script>

<style scoped>
.error-page {
  position: relative;
  background-color: #0a0a0a;
  background-image: url("/svg/grid-background.svg"), url("/svg/noiseEffect.svg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 0 20px;
}

.content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 200px;
  margin-bottom: 155px;
  position: relative;
}

.hand {
  position: relative;
  transform: translateY(0);
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hand::before {
  content: '';
  position: absolute;
  width: 300%;
  height: 300%;
  background: radial-gradient(circle, rgba(242, 74, 74, 0.29) 0%, rgba(242, 74, 74, 0) 70%);
  border-radius: 50%;
}

.hand img {
  width: 150px;
  height: auto;
}

.text {
  text-align: left;
  max-width: 400px;
  margin-left: 10px;
}

h1 {
  font: 900 120px var(--font-family);
  color: #f24a4a;
  margin: 0 0 -19px 0;
}

p {
  font: 400 23px var(--font-family);
  color: #fff;
  margin: 20px 0;
}

.uri {
  font: 700 23px var(--font-family);
  color: #f24a4a;
}

.buttons {
  display: flex;
  gap: 10px;
}

.btn {
  font: 400 16px var(--font-family);
  color: #ececec;
  border-radius: 5px;
  padding: 11px 18px;
  height: 20px;
  text-decoration: none;
  background: #f24747;
  transition: background 0.3s ease;
}

.btn, .status-page {
  border: 1px solid rgba(96, 96, 96, 0.5);
  border-radius: 5px;
  padding: 11px 18px;
  backdrop-filter: blur(5px);
  background: rgba(0, 0, 0, 0.25);
}

.btn.red {
  background: #f24a4a;
}

.btn:hover {
  background: rgba(242, 74, 74, 0.75);
}

.status-page:hover {
  background: rgba(200, 200, 200, 0.25);
}

@media (max-width: 768px) {
  .content {
    flex-direction: column;
    gap: 30px;
    margin-left: 0;
    margin-bottom: 50px;
  }

  .hand {
    width: 100px;
    height: 100px;
  }

  .hand img {
    width: 100px;
    height: auto;
  }

  .text {
    text-align: center;
    margin-left: 0;
    max-width: 90%;
  }

  h1 {
    font-size: 80px;
  }

  p {
    font-size: 18px;
  }

  .uri {
    font-size: 18px;
  }

  .buttons {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .btn, .status-page {
    padding: 10px 15px;
  }
}
</style>
