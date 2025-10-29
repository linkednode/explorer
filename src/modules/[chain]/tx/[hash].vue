<script lang="ts" setup>
import { useBaseStore, useBlockchain, useFormatter } from '@/stores';
import DynamicComponent from '@/components/dynamic/DynamicComponent.vue';
import { computed, ref } from '@vue/reactivity';
import type { Tx, TxResponse } from '@/types';

import { JsonViewer } from 'vue3-json-viewer';
// if you used v1.0.5 or latster ,you should add import "vue3-json-viewer/dist/index.css"
import 'vue3-json-viewer/dist/index.css';

const props = defineProps(['hash', 'chain']);

const blockchain = useBlockchain();
const baseStore = useBaseStore();
const format = useFormatter();
const tx = ref(
  {} as {
    tx: Tx;
    tx_response: TxResponse;
  }
);
if (props.hash) {
  blockchain.rpc.getTx(props.hash).then((x) => (tx.value = x));
}
const messages = computed(() => {
  return (
    tx.value.tx?.body?.messages.map((x) => {
      if (x.packet?.data) {
        // @ts-ignore
        x.message = format.base64ToString(x.packet.data);
      }
      return x;
    }) || []
  );
});
</script>
<template>
  <div>
    <div class="tabs tabs-boxed bg-base-200 mb-6">
      <RouterLink class="tab text-neutral-content uppercase" :to="`/${chain}/tx/?tab=recent`">{{
        $t('block.recent')
      }}</RouterLink>
      <RouterLink class="tab text-neutral-content uppercase" :to="`/${chain}/tx/?tab=search`">Search</RouterLink>
      <a class="tab text-neutral-content uppercase tab-active">Transaction</a>
    </div>

    <div v-if="tx.tx_response" class="bg-base-100 shadow-md rounded-box p-4 mb-6">
      <h2 class="text-xl font-bold text-base-content mb-4">{{ $t('tx.title') }}</h2>
      <div class="overflow-x-auto">
        <table class="table w-full">
          <tbody>
            <tr>
              <td class="font-medium text-base-content">{{ $t('tx.tx_hash') }}</td>
              <td class="text-neutral-content break-all">{{ tx.tx_response.txhash }}</td>
            </tr>
            <tr>
              <td class="font-medium text-base-content">{{ $t('account.height') }}</td>
              <td>
                <RouterLink :to="`/${props.chain}/block/${tx.tx_response.height}`" class="link link-hover text-primary"
                  >{{ tx.tx_response.height }}
                </RouterLink>
              </td>
            </tr>
            <tr>
              <td class="font-medium text-base-content">{{ $t('staking.status') }}</td>
              <td>
                <div class="flex items-center">
                  <span
                    class="badge"
                    :class="tx.tx_response.code === 0 ? 'badge-success' : 'badge-error'"
                  >
                    {{ tx.tx_response.code === 0 ? 'Success' : 'Failed' }}
                  </span>
                  <span v-if="tx.tx_response.code !== 0" class="ml-2 text-error text-sm">
                    {{ tx?.tx_response?.raw_log }}
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="font-medium text-base-content">{{ $t('account.time') }}</td>
              <td class="text-neutral-content">
                {{ format.toLocaleDate(tx.tx_response.timestamp) }} ({{
                  format.toDay(tx.tx_response.timestamp, 'from')
                }})
              </td>
            </tr>
            <tr>
              <td class="font-medium text-base-content">{{ $t('tx.gas') }}</td>
              <td class="text-neutral-content">{{ tx.tx_response.gas_used }} / {{ tx.tx_response.gas_wanted }}</td>
            </tr>
            <tr>
              <td class="font-medium text-base-content">{{ $t('tx.fee') }}</td>
              <td class="text-neutral-content">
                {{ format.formatTokens(tx.tx?.auth_info?.fee?.amount, true, '0,0.[00]') }}
              </td>
            </tr>
            <tr>
              <td class="font-medium text-base-content">{{ $t('tx.memo') }}</td>
              <td class="text-neutral-content">{{ tx.tx.body.memo || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="tx.tx_response" class="bg-base-100 shadow-md rounded-box p-4 mb-6">
      <h2 class="text-xl font-bold text-base-content mb-4">{{ $t('account.messages') }}: ({{ messages.length }})</h2>
      <div v-for="(msg, i) in messages" :key="i">
        <div class="border border-base-300 rounded-box p-4 mt-4">
          <DynamicComponent :value="msg" />
        </div>
      </div>
      <div v-if="messages.length === 0" class="text-neutral-content mt-4">{{ $t('tx.no_messages') }}</div>
    </div>

    <div v-if="tx.tx_response" class="bg-base-100 shadow-md rounded-box p-4">
      <h2 class="text-xl font-bold text-base-content mb-4">JSON</h2>
      <div class="bg-base-200 rounded-box p-4">
        <JsonViewer
          :value="tx"
          :theme="baseStore.theme"
          style="background: transparent"
          copyable
          boxed
          sort
          expand-depth="5"
        />
      </div>
    </div>
  </div>
</template>
