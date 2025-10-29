<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { controlledComputed } from '@vueuse/core';

interface Props {
  title: string;
  color?: string;
  icon: string;
  stats: string;
  change?: number;
  subtitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
});

const isPositive = controlledComputed(
  () => props.change,
  () => Math.sign(props.change || 0) === 1
);
</script>

<template>
  <div class="bg-base-100 shadow-md rounded-box p-4">
    <div class="flex items-center justify-between">
      <div v-if="props.icon" class="relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
        <Icon :class="[`text-${props?.color}`]" :icon="props.icon" class="text-2xl" />
        <div class="absolute top-0 left-0 bottom-0 right-0 opacity-20" :class="[`bg-${props?.color}`]"></div>
      </div>

      <div
        v-if="props.change"
        :class="isPositive ? 'text-success' : 'text-error'"
        class="flex items-center text-sm font-semibold"
      >
        <span>{{ isPositive ? `+${props.change}` : props.change }}%</span>
        <Icon :icon="isPositive ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
      </div>
    </div>

    <div class="mt-4">
      <h6 class="text-xl text-base-content font-bold mb-1">
        {{ props.stats || '-' }}
      </h6>
      <p class="text-sm text-neutral-content">
        {{ props.title }}
      </p>

      <div v-if="props.subtitle" class="text-xs font-medium text-neutral-content mt-1">
        <span class="truncate">{{ props.subtitle }}</span>
      </div>
    </div>
  </div>
</template>
