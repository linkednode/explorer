<script lang="ts" setup>
import type { PropType } from 'vue';

const props = defineProps({
  blocks: { type: Array as PropType<{ height: string; color: string }[]> },
});
</script>
<template>
  <div class="flex gap-0.5 h-4">
    <div class="cursor-default h-full" v-for="(item, index) in blocks" :key="index">
      <div class="tooltip h-full rounded-full" :data-tip="item.height" :class="item.color" style="width: 3px">&nbsp;</div>
    </div>
  </div>
</template>

<style></style>
