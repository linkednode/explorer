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

// Color mapping for gradient backgrounds
const colorGradients: Record<string, string> = {
  primary: 'from-primary/20 to-primary/5',
  secondary: 'from-secondary/20 to-secondary/5',
  success: 'from-success/20 to-success/5',
  warning: 'from-warning/20 to-warning/5',
  error: 'from-error/20 to-error/5',
  info: 'from-info/20 to-info/5',
};

const getGradient = (color: string) => colorGradients[color] || colorGradients.primary;
</script>

<template>
  <div class="group bg-base-100 rounded-xl border border-base-300/40 p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-soft">
    <div class="flex items-start justify-between">
      <!-- Icon with gradient background -->
      <div 
        v-if="props.icon" 
        class="relative w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
      >
        <div 
          class="absolute inset-0 bg-gradient-to-br opacity-100"
          :class="getGradient(props.color || 'primary')"
        ></div>
        <Icon 
          :class="[`text-${props?.color}`]" 
          :icon="props.icon" 
          class="text-2xl relative z-10" 
        />
      </div>

      <!-- Change indicator -->
      <div
        v-if="props.change !== undefined && props.change !== 0"
        class="flex items-center gap-0.5 text-sm font-semibold px-2 py-1 rounded-lg"
        :class="isPositive ? 'text-success bg-success/10' : 'text-error bg-error/10'"
      >
        <Icon 
          :icon="isPositive ? 'mdi-trending-up' : 'mdi-trending-down'" 
          class="text-base"
        />
        <span>{{ isPositive ? `+${props.change}` : props.change }}%</span>
      </div>
    </div>

    <div class="mt-4">
      <!-- Stats value -->
      <h6 class="text-2xl text-base-content font-bold mb-1 tracking-tight">
        {{ props.stats || '-' }}
      </h6>
      
      <!-- Title -->
      <p class="text-sm text-base-content/60 font-medium">
        {{ props.title }}
      </p>

      <!-- Subtitle -->
      <div 
        v-if="props.subtitle" 
        class="text-xs text-base-content/40 mt-2 truncate"
      >
        {{ props.subtitle }}
      </div>
    </div>
  </div>
</template>
