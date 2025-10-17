<script lang="ts" setup>
import type { PropType } from 'vue';
import { useFormatter } from '@/stores';
import { formatSeconds } from '@/libs/utils';
const props = defineProps({
  cardItem: {
    type: Object as PropType<{ title: string; items: Array<any> }>,
  },
});

const formatter = useFormatter();
function calculateValue(value: any) {
  if (Array.isArray(value)) {
    return (value[0] && value[0].amount) || '-';
  }
  if (String(value).search(/^\d+s$/g) > -1) {
    return formatSeconds(value);
  }
  const newValue = Number(value);
  if (`${newValue}` === 'NaN' || typeof value === 'boolean') {
    return value;
  }

  if (newValue < 1 && newValue > 0) {
    return formatter.formatDecimalToPercent(value);
  }
  return newValue;
}

function formatTitle(v: string) {
  if (!v) return '';
  return v.replace(/_/g, ' ');
}
</script>
<template>
  <div
    class="card bg-base-100 shadow-lg rounded-box mt-6 p-6"
    v-if="props.cardItem?.items && props.cardItem?.items?.length > 0"
  >
    <h2 class="card-title text-xl mb-4 text-base-content">{{ props.cardItem?.title }}</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <div v-for="(item, index) of props.cardItem?.items" :key="index" class="bg-base-200 p-4 rounded-lg shadow-md">
        <div class="text-sm mb-1 text-neutral-content capitalize">{{ formatTitle(item?.subtitle) }}</div>
        <div class="text-lg font-semibold text-base-content">{{ calculateValue(item?.value) }}</div>
      </div>
    </div>
  </div>
</template>
