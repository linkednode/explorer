<script lang="ts" setup>
import { useFormatter } from '@/stores';
import type { Tally } from '@/types';
import { computed } from '@vue/reactivity';
import type { PropType } from 'vue';

const props = defineProps({
  tally: { type: Object as PropType<Tally> },
  pool: {
    type: Object as PropType<{
      not_bonded_tokens: string;
      bonded_tokens: string;
    }>,
  },
});
const total = computed(() => props.pool?.bonded_tokens);
const format = useFormatter();
const yes = computed(() => format.calculatePercent(props.tally?.yes, total.value));
const no = computed(() => format.calculatePercent(props.tally?.no, total.value));
const abstain = computed(() => format.calculatePercent(props.tally?.abstain, total.value));
const veto = computed(() => format.calculatePercent(props.tally?.no_with_veto, total.value));
</script>

<template>
  <div class="progress rounded-full h-6 text-xs flex items-center overflow-hidden bg-base-300">
    <div class="h-full bg-success flex items-center pl-2 text-white overflow-hidden" :style="`width: ${yes}`" :title="yes">
      {{ yes }}
    </div>
    <div class="h-full bg-error flex items-center text-white overflow-hidden" :style="`width: ${no}`" :title="no">
      {{ no }}
    </div>
    <div class="h-full bg-warning flex items-center text-white overflow-hidden" :style="`width: ${veto};`" :title="veto">
      {{ veto }}
    </div>
    <div
      class="h-full bg-neutral flex items-center text-white overflow-hidden"
      :style="`width: ${abstain}`"
      :title="abstain"
    >
      {{ abstain }}
    </div>
  </div>
</template>
<style scoped>
/* No custom styles needed, relying on Tailwind/DaisyUI */
</style>
