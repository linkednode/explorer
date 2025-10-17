<script lang="ts" setup>
import { onMounted, ref, watchEffect } from 'vue';
import { Icon } from '@iconify/vue';
import TxsElement from '@/components/dynamic/TxsElement.vue';
import DynamicComponent from '@/components/dynamic/DynamicComponent.vue';
import { computed } from '@vue/reactivity';
import { onBeforeRouteUpdate } from 'vue-router';
import { useBaseStore, useFormatter } from '@/stores';
import type { Block } from '@/types';
import Countdown from '@/components/Countdown.vue';

const props = defineProps(['height', 'chain']);

const store = useBaseStore();
const format = useFormatter();
const current = ref({} as Block);
const target = ref(Number(props.height || 0));

const height = computed(() => {
  return Number(current.value.block?.header?.height || props.height || 0);
});

const isFutureBlock = computed({
  get: () => {
    const latest = store.latest?.block?.header.height;
    const isFuture = latest ? target.value > Number(latest) : true;
    if (!isFuture && !current.value.block_id) store.fetchBlock(target.value).then((x) => (current.value = x));
    return isFuture;
  },
  set: (val) => {
    console.log(val);
  },
});

const remainingBlocks = computed(() => {
  const latest = store.latest?.block?.header.height;
  return latest ? Number(target.value) - Number(latest) : 0;
});

const estimateTime = computed(() => {
  const seconds = Number((remainingBlocks.value * store.blocktime).toFixed(2));
  return seconds;
});

const estimateDate = computed(() => {
  return new Date(new Date().getTime() + estimateTime.value);
});

const edit = ref(false);
const newHeight = ref(props.height);
function updateTarget() {
  target.value = Number(newHeight.value);
  console.log(target.value);
}

onBeforeRouteUpdate(async (to, from, next) => {
  if (from.path !== to.path) {
    store.fetchBlock(String(to.params.height)).then((x) => (current.value = x));
    next();
  }
});
</script>
<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="isFutureBlock" class="card bg-base-100 shadow-xl rounded-box p-6 text-center">
      <div v-if="remainingBlocks > 0">
        <h2 class="text-4xl font-extrabold text-primary mb-6">#{{ target }}</h2>
        <Countdown :time="estimateTime" css="text-5xl font-sans mb-6" />
        <p class="text-lg text-neutral-content mb-8">
          {{ $t('block.estimated_time') }}:
          <span class="font-bold text-base-content">{{ format.toLocaleDate(estimateDate) }}</span>
        </p>
        <div class="flex justify-center">
          <div class="overflow-x-auto">
            <table class="table w-full max-w-md bg-base-200 rounded-lg shadow-md">
              <tbody>
                <tr class="hover cursor-pointer" @click="edit = !edit">
                  <td class="font-semibold">{{ $t('block.countdown_for_block') }}:</td>
                  <td class="text-right text-base-content">{{ target }}</td>
                </tr>
                <tr v-if="edit">
                  <td colspan="2" class="text-center py-4">
                    <h3 class="text-lg font-bold text-base-content mb-3">{{ $t('block.countdown_for_block_input') }}</h3>
                    <div class="join">
                      <input class="input input-bordered join-item input-primary" v-model="newHeight" type="number" />
                      <button class="btn btn-primary join-item" @click="updateTarget()">
                        {{ $t('block.btn_update') }}
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="font-semibold">{{ $t('block.current_height') }}:</td>
                  <td class="text-right text-base-content">#{{ store.latest?.block?.header.height }}</td>
                </tr>
                <tr>
                  <td class="font-semibold">{{ $t('block.remaining_blocks') }}:</td>
                  <td class="text-right text-base-content">{{ remainingBlocks }}</td>
                </tr>
                <tr>
                  <td class="font-semibold">{{ $t('block.average_block_time') }}:</td>
                  <td class="text-right text-base-content">
                    {{ (store.blocktime / 1000).toFixed(1) }}s
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="card bg-base-100 shadow-xl rounded-box p-6 mb-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 class="text-3xl font-bold text-base-content mb-2 sm:mb-0">#{{ current.block?.header?.height }}</h2>
          <div class="flex gap-2" v-if="props.height">
            <RouterLink
              :to="`/${store.blockchain.chainName}/block/${height - 1}`"
              class="btn btn-outline btn-primary btn-circle"
            >
              <Icon icon="mdi-arrow-left" class="text-2xl" />
            </RouterLink>
            <RouterLink
              :to="`/${store.blockchain.chainName}/block/${height + 1}`"
              class="btn btn-outline btn-primary btn-circle"
            >
              <Icon icon="mdi-arrow-right" class="text-2xl" />
            </RouterLink>
          </div>
        </div>
        <div class="divider"></div>
        <h3 class="text-xl font-semibold text-base-content mb-3">{{ $t('block.block_id') }}</h3>
        <DynamicComponent :value="current.block_id" class="bg-base-200 p-4 rounded-lg" />
      </div>

      <div class="card bg-base-100 shadow-xl rounded-box p-6 mb-6">
        <h3 class="text-xl font-semibold text-base-content mb-3">{{ $t('block.block_header') }}</h3>
        <DynamicComponent :value="current.block?.header" class="bg-base-200 p-4 rounded-lg" />
      </div>

      <div class="card bg-base-100 shadow-xl rounded-box p-6 mb-6">
        <h3 class="text-xl font-semibold text-base-content mb-3">{{ $t('account.transactions') }}</h3>
        <TxsElement :value="current.block?.data?.txs" class="bg-base-200 p-4 rounded-lg" />
      </div>

      <div class="card bg-base-100 shadow-xl rounded-box p-6">
        <h3 class="text-xl font-semibold text-base-content mb-3">{{ $t('block.last_commit') }}</h3>
        <DynamicComponent :value="current.block?.last_commit" class="bg-base-200 p-4 rounded-lg" />
      </div>
    </div>
  </div>
</template>
