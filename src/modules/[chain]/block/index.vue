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
  <div>
    <div class="tabs tabs-boxed bg-base-100 shadow-md rounded-box mb-4">
      <a role="tab" class="tab text-neutral-content uppercase" :class="{ 'tab-active': tab === 'blocks' }" @click="tab = 'blocks'">{{
        $t('block.recent')
      }}</a>
      <RouterLink
        class="tab text-neutral-content uppercase"
        :to="`/${chain}/block/${Number(base.latest?.block?.header.height || 0) + 10000}`"
        >{{ $t('block.future') }}</RouterLink
      >
    </div>

    <div v-show="tab === 'blocks'">
      <TxsInBlocksChart />

      <div class="grid xl:!grid-cols-6 md:!grid-cols-4 grid-cols-1 gap-3 mt-4">
        <RouterLink
          v-for="item in list"
          :key="item.block.header.height"
          class="flex flex-col justify-between rounded-box p-4 shadow-md bg-base-100 hover:bg-base-200 transition-colors duration-200"
          :to="`/${chain}/block/${item.block.header.height}`"
        >
          <div class="flex justify-between">
            <h3 class="text-lg font-bold sm:!text-xl text-base-content">
              {{ item.block.header.height }}
            </h3>
            <span class="badge badge-outline badge-success text-xs whitespace-nowrap">
              {{ format.toDay(item.block?.header?.time, 'from') }}
            </span>
          </div>
          <div class="flex justify-between tooltip" data-tip="Block Proposor">
            <div class="mt-2 hidden text-sm text-neutral-content sm:!block truncate">
              <span>{{ format.validator(item.block?.header?.proposer_address) }}</span>
            </div>
            <span class="text-right mt-1 whitespace-nowrap text-neutral-content"> {{ item.block?.data?.txs.length }} txs </span>
          </div>
        </RouterLink>
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
