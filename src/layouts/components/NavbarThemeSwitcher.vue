<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { onMounted, computed, ref } from 'vue';
import { useBaseStore } from '@/stores';

const themeMap: Record<string, string> = {
  system: 'mdi-laptop',
  light: 'mdi-weather-sunny',
  dark: 'mdi-weather-night',
};

const baseStore = useBaseStore();
const isAnimating = ref(false);

const theme = computed(() => {
  return baseStore.theme;
});

const isDark = computed(() => theme.value === 'dark');

const changeMode = (val?: 'dark' | 'light') => {
  // Trigger animation
  isAnimating.value = true;
  setTimeout(() => {
    isAnimating.value = false;
  }, 300);

  let value: 'dark' | 'light' = 'dark';
  const currentValue: 'dark' | 'light' = val || theme.value;
  if (currentValue === 'dark') {
    value = 'light';
  }
  if (value === 'light') {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }
  document.documentElement.setAttribute('data-theme', value);
  window.localStorage.setItem('theme', value);
  baseStore.theme = value;
};

onMounted(() => {
  changeMode(theme.value === 'light' ? 'dark' : 'light');
});
</script>

<template>
  <div class="tooltip tooltip-bottom" data-tip="Toggle theme">
    <button 
      class="btn btn-ghost btn-circle btn-sm mx-1 relative overflow-hidden group"
      @click="changeMode()"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <!-- Background glow effect -->
      <div 
        class="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        :class="isDark ? 'bg-warning/10' : 'bg-primary/10'"
      ></div>
      
      <!-- Sun icon (shown in dark mode) -->
      <Icon 
        v-if="isDark"
        icon="mdi-weather-sunny" 
        class="text-xl text-warning transition-all duration-300"
        :class="{ 'rotate-180 scale-0': isAnimating }"
      />
      
      <!-- Moon icon (shown in light mode) -->
      <Icon 
        v-else
        icon="mdi-weather-night" 
        class="text-xl text-primary transition-all duration-300"
        :class="{ '-rotate-90 scale-0': isAnimating }"
      />
    </button>
  </div>
</template>

<style scoped>
.btn-ghost:hover {
  background-color: transparent;
}
</style>
