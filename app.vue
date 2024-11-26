<template>
  <div>
    <LoadingSpinner v-if="isLoading" />
    <NuxtPage v-else />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import LoadingSpinner from '~/components/loading.vue';

export default {
  components: {
    LoadingSpinner
  },
  setup() {
    const isLoading = ref(true);

    onMounted(() => {
      setTimeout(() => {
        isLoading.value = false;
      }, 3500);
    });

    return { isLoading };
  }
};
</script>

<style>
html, body {
  height: 100vh;
  margin: 0;
  padding: 0;
  background: #000000;
  color: white;
  color-scheme: dark;
  font-family: 'Inter', sans-serif;
}
</style>
