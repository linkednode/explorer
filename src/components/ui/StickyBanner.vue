<template>
  <div v-if="isVisible" :class="['fixed top-0 z-50 w-full p-4 text-center flex items-center justify-center relative', className]">
    <slot />
    <button @click="closeBanner" class="absolute right-4 top-1/2 -translate-y-1/2 text-white text-lg font-bold">
      &times;
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  className?: string;
}

defineProps<Props>();

const isVisible = ref(true);

const closeBanner = () => {
  isVisible.value = false;
};
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>
