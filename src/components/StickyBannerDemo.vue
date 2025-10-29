<template>
  <div class="relative flex w-full flex-col">
    <StickyBanner class="bg-gradient-to-b from-red-500 to-red-600">
      <p class="mx-0 max-w-[90%] text-white drop-shadow-md">
        ⚠️ <span class="font-bold">Development Warning:</span>
        <a class="transition duration-200 hover:underline">
          This website is under development. Use at your own risk.
        </a>
      </p>
    </StickyBanner>
    <DummyContent />
  </div>
</template>

<script setup lang="ts">
import StickyBanner from './ui/StickyBanner.vue';
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>
