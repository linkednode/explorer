<script lang="ts" setup>
import { useDashboard } from '@/stores';
import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
});

const dashboardStore = useDashboard();
const conf = computed(() => dashboardStore.chains[props.name] || {});
const imageLoaded = ref(false);
const imageError = ref(false);

const isFavorite = computed(() => dashboardStore?.favoriteMap?.[props.name]);

const addFavor = (e: Event) => {
  e.stopPropagation();
  e.preventDefault();
  dashboardStore.favoriteMap[props.name] = !dashboardStore?.favoriteMap?.[props.name];
  window.localStorage.setItem('favoriteMap', JSON.stringify(dashboardStore.favoriteMap));
};

const onImageLoad = () => {
  imageLoaded.value = true;
};

const onImageError = () => {
  imageError.value = true;
  imageLoaded.value = true;
};
</script>
<template>
  <RouterLink
    :to="`/${name}`"
    class="group relative bg-base-100 rounded-xl border border-base-300/40 flex items-center px-4 py-3.5 cursor-pointer transition-all duration-200 hover:border-primary/30 hover:shadow-medium hover:-translate-y-0.5"
    :class="{
      'ring-2 ring-warning/20 border-warning/30': featured,
    }"
  >
    <!-- Featured indicator -->
    <div 
      v-if="featured" 
      class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-warning rounded-full flex items-center justify-center shadow-sm"
    >
      <span class="text-2xs">🔥</span>
    </div>

    <!-- Logo with loading state -->
    <div class="relative w-10 h-10 rounded-xl overflow-hidden bg-base-200 flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
      <!-- Skeleton loader -->
      <div 
        v-if="!imageLoaded" 
        class="absolute inset-0 bg-base-300 animate-pulse"
      ></div>
      <!-- Fallback icon -->
      <div 
        v-if="imageError" 
        class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10"
      >
        <Icon icon="mdi:cube-outline" class="text-xl text-primary/60" />
      </div>
      <!-- Actual image -->
      <img 
        :src="conf.logo" 
        :alt="conf?.prettyName || props.name"
        class="w-full h-full object-cover transition-opacity duration-200"
        :class="{ 'opacity-0': !imageLoaded || imageError, 'opacity-100': imageLoaded && !imageError }"
        @load="onImageLoad"
        @error="onImageError"
      />
    </div>

    <!-- Chain name -->
    <div class="ml-3 flex-1 min-w-0">
      <div class="font-semibold text-base truncate capitalize text-base-content group-hover:text-primary transition-colors duration-200">
        {{ conf?.prettyName || props.name }}
      </div>
      <div class="text-xs text-base-content/50 truncate">
        {{ props.name }}
      </div>
    </div>

    <!-- Favorite button -->
    <button
      @click="addFavor"
      class="p-2 rounded-lg transition-all duration-200 hover:bg-base-200 ml-2 flex-shrink-0"
      :class="{
        'text-warning hover:text-warning/80': isFavorite,
        'text-base-content/30 hover:text-warning/60': !isFavorite,
      }"
    >
      <Icon 
        :icon="isFavorite ? 'mdi-star' : 'mdi-star-outline'" 
        class="text-xl transition-transform duration-200"
        :class="{ 'scale-110': isFavorite }"
      />
    </button>

    <!-- Hover arrow indicator -->
    <Icon 
      icon="mdi:chevron-right" 
      class="text-lg text-base-content/20 group-hover:text-primary/60 transition-all duration-200 group-hover:translate-x-0.5 ml-1"
    />
  </RouterLink>
</template>

<style scoped>
.text-2xs {
  font-size: 0.625rem;
  line-height: 0.875rem;
}
</style>
