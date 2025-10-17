<script lang="ts" setup>
import { computed, ref } from '@vue/reactivity';
import { useBaseStore, useFormatter } from '@/stores';
import TxsInBlocksChart from '@/components/charts/TxsInBlocksChart.vue';

const props = defineProps(['chain']);

const tab = ref('blocks');

const base = useBaseStore();

const format = useFormatter();

const list = computed(() => {
  // const recents = base.recents
  // return recents.sort((a, b) => (Number(b.block.header.height) - Number(a.block.header.height)))
  return base.recents;
});
</script>
<template>
  <div class="container mx-auto px-4 py-8">
    <div class="card bg-base-100 shadow-xl rounded-box p-6">
      <div class="tabs tabs-boxed bg-base-200 mb-6 p-1 rounded-lg flex justify-center">
        <a class="tab tab-lg flex-1 font-semibold" :class="{ 'tab-active tab-primary': tab === 'blocks' }" @click="tab = 'blocks'">
          {{ $t('block.recent') }}
        </a>
        <RouterLink
          class="tab tab-lg flex-1 font-semibold"
          :to="`/${chain}/block/${Number(base.latest?.block?.header.height || 0) + 10000}`"
        >
          {{ $t('block.future') }}
        </RouterLink>
      </div>

      <div v-show="tab === 'blocks'">
        <TxsInBlocksChart class="mb-8" />

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <RouterLink
            v-for="item in list"
            :key="item.block.header.height"
            class="card bg-base-200 shadow-md rounded-box p-5 hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between"
            :to="`/${chain}/block/${item.block.header.height}`"
          >
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-xl font-bold text-primary">
                #{{ item.block.header.height }}
              </h3>
              <span class="text-xs text-neutral-content">
                {{ format.toDay(item.block?.header?.time, 'from') }}
              </span>
            </div>
            <div class="text-sm text-base-content mb-2">
              <span class="font-semibold">{{ $t('block.proposer') }}: </span>
              <span class="truncate">{{ format.validator(item.block?.header?.proposer_address) }}</span>
            </div>
            <div class="flex justify-between items-center text-sm text-neutral-content">
              <span>{{ item.block?.data?.txs.length }} {{ $t('block.txs') }}</span>
              <Icon icon="mdi:arrow-right" class="text-lg" />
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<route>
    {
      meta: {
        i18n: 'blocks',
        order: 5
      }
    }
  </route>
