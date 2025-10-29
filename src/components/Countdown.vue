<script lang="ts" setup>
import Countdown from '@chenfengyuan/vue-countdown';
import { ref } from 'vue';

const props = defineProps({
  time: { type: Number },
  css: { type: String },
});

const s = ref(0);
</script>
<template>
  <div v-if="time" class="flex items-center justify-center space-x-2 text-base-content">
    <Countdown
      :time="time > 0 ? time : 0"
      v-slot="{ days, hours, minutes, seconds }"
    >
      <span class="flex flex-col items-center">
        <span class="text-primary font-bold text-2xl" :class="css">{{ days }}</span>
        <span class="text-xs text-neutral-content">days</span>
      </span>
      <span class="text-primary font-bold text-2xl">:</span>
      <span class="flex flex-col items-center">
        <span class="text-primary font-bold text-2xl" :class="css">{{ hours }}</span>
        <span class="text-xs text-neutral-content">hours</span>
      </span>
      <span class="text-primary font-bold text-2xl">:</span>
      <span class="flex flex-col items-center">
        <span class="text-primary font-bold text-2xl" :class="css">{{ minutes }}</span>
        <span class="text-xs text-neutral-content">minutes</span>
      </span>
      <span class="text-primary font-bold text-2xl">:</span>
      <span class="flex flex-col items-center">
        <Transition name="slide-up" mode="out-in">
          <span :key="seconds" class="text-primary font-bold text-2xl" :class="css">{{ seconds }}</span>
        </Transition>
        <span class="text-xs text-neutral-content">seconds</span>
      </span>
    </Countdown>
  </div>
</template>

<style>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(calc(80%));
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-calc(15%));
}
</style>
