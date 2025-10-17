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
  <div class="card bg-base-100 shadow-lg rounded-box p-6 text-center">
    <div class="card-body p-0">
      <div class="flex flex-col items-center justify-center mb-4">
        <div v-if="props.icon" class="relative w-12 h-12 rounded-full flex items-center justify-center mb-2"
             :class="[`bg-${props?.color}/20`, `text-${props?.color}`]">
          <Icon :icon="props.icon" class="text-3xl" />
        </div>

        <div
          v-if="props.change"
          :class="isPositive ? 'text-success' : 'text-error'"
          class="flex items-center text-sm font-semibold"
        >
          <span>{{ isPositive ? `+${props.change}` : props.change }}%</span>
          <Icon :icon="isPositive ? 'mdi-arrow-top-right' : 'mdi-arrow-bottom-right'" class="ml-1" />
        </div>
      </div>

      <h3 class="text-2xl font-bold text-base-content mb-1">
        {{ props.stats || '-' }}
      </h3>
      <p class="text-sm text-neutral-content">
        {{ props.title }}
      </p>

      <div v-if="props.subtitle" class="text-xs font-medium text-neutral-content mt-2">
        <span class="truncate">{{ props.subtitle }}</span>
      </div>
    </div>
  </div>
</template>
