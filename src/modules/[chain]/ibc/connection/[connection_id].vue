<script lang="ts" setup>
import { formatSeconds } from '@/libs/utils';
import { useBaseStore, useBlockchain, useFormatter } from '@/stores';
import {
  type Connection,
  type ClientState,
  type Channel,
  PageRequest,
  type TxResponse,
  type PaginatedTxs,
} from '@/types';
import { computed, onMounted } from 'vue';
import { ref } from 'vue';
import { useIBCModule } from '../connStore';
import PaginationBar from '@/components/PaginationBar.vue';
import { Icon } from '@iconify/vue';

const props = defineProps(['chain', 'connection_id']);
const chainStore = useBlockchain();
const baseStore = useBaseStore();
const format = useFormatter();
const ibcStore = useIBCModule();
const conn = ref({} as Connection);
const clientState = ref({} as { client_id: string; client_state: ClientState });
const channels = ref([] as Channel[]);

const connId = computed(() => {
  return props.connection_id || 0;
});

const loading = ref(false);
const txs = ref({} as PaginatedTxs);
const direction = ref('');
const channel_id = ref('');
const port_id = ref('');
const page = ref(new PageRequest());
page.value.limit = 5;

onMounted(() => {
  if (connId.value) {
    chainStore.rpc.getIBCConnectionsById(connId.value).then((x) => {
      conn.value = x.connection;
    });
    chainStore.rpc.getIBCConnectionsClientState(connId.value).then((x) => {
      clientState.value = x.identified_client_state;
    });
    chainStore.rpc.getIBCConnectionsChannels(connId.value).then((x) => {
      channels.value = x.channels;
    });
  }
});

function loadChannel(channel: string, port: string) {
  chainStore.rpc.getIBCChannelNextSequence(channel, port).then((x) => {
    console.log(x);
  });
}

function pageload(pageNum: number) {
  if (direction.value === 'In') {
    fetchSendingTxs(channel_id.value, port_id.value, pageNum - 1);
  } else {
    fetchSendingTxs(channel_id.value, port_id.value, pageNum - 1);
  }
}

function fetchSendingTxs(channel: string, port: string, pageNum = 0) {
  page.value.setPage(pageNum);
  loading.value = true;
  direction.value = 'Out';
  channel_id.value = channel;
  port_id.value = port;
  txs.value = {} as PaginatedTxs;
  chainStore.rpc
    .getTxs(
      "?order_by=2&events=send_packet.packet_src_channel='{channel}'&events=send_packet.packet_src_port='{port}'",
      { channel, port },
      page.value
    )
    .then((res) => {
      txs.value = res;
    })
    .finally(() => (loading.value = false));
}
function fetchRecevingTxs(channel: string, port: string, pageNum = 0) {
  page.value.setPage(pageNum);
  loading.value = true;
  direction.value = 'In';
  channel_id.value = channel;
  port_id.value = port;
  txs.value = {} as PaginatedTxs;
  chainStore.rpc
    .getTxs(
      "?order_by=2&events=recv_packet.packet_dst_channel='{channel}'&events=recv_packet.packet_dst_port='{port}'",
      { channel, port },
      page.value
    )
    .then((res) => {
      txs.value = res;
    })
    .finally(() => (loading.value = false));
}

function color(v: string) {
  if (v && v.indexOf('_OPEN') > -1) {
    return 'success';
  }
  return 'warning';
}
</script>
<template>
  <div class="">
    <div class="bg-base-100 shadow-md rounded-box px-4 pt-3 pb-4 mb-4">
      <div class="mx-auto max-w-7xl px-6 lg:!px-8">
        <dl class="grid grid-cols-1 gap-x-6 text-center lg:!grid-cols-3">
          <div class="mx-auto flex items-center">
            <div>
              <div
                class="order-first text-3xl font-bold tracking-tight text-base-content mb-1"
              >
                {{ baseStore.latest?.block?.header?.chain_id }}
              </div>
              <div class="text-sm text-neutral-content">
                {{ conn.client_id }} {{ props.connection_id }}
              </div>
            </div>
          </div>
          <div class="mx-auto flex items-center">
            <div :class="{ 'text-success': conn.state?.indexOf('_OPEN') > -1 }" class="text-base-content">
              <span class="text-lg rounded-full">&#x21cc;</span>
              <div class="text-base-content">
                {{ conn.state }}
              </div>
            </div>
          </div>
          <div class="mx-auto">
            <div
              class="order-first text-3xl font-bold tracking-tight text-base-content mb-2"
            >
              {{ clientState.client_state?.chain_id }}
            </div>
            <div class="text-sm text-neutral-content">
              {{ conn.counterparty?.connection_id }} {{ clientState.client_id }}
            </div>
          </div>
        </dl>
      </div>
    </div>

    <div class="bg-base-100 shadow-md rounded-box px-4 pt-3 pb-4 mb-4">
      <h2 class="text-xl font-semibold mb-4 overflow-hidden text-base-content">
        {{ $t('ibc.title_2')
        }}<span class="ml-2 text-sm text-neutral-content">{{
          clientState.client_state?.['@type']
        }}</span>
      </h2>
      <div class="overflow-x-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <table class="table table-sm capitalize w-full table-zebra">
          <thead class="bg-base-200">
            <tr>
              <th colspan="3" class="text-base-content font-semibold">{{ $t('ibc.trust_parameters') }}</th>
            </tr>
          </thead>
          <tbody class="text-base-content">
            <tr>
              <td class="w-52">{{ $t('ibc.trust_level') }}:</td>
              <td>
                {{ clientState.client_state?.trust_level?.numerator }}/{{
                  clientState.client_state?.trust_level?.denominator
                }}
              </td>
            </tr>
            <tr>
              <td class="w-52">{{ $t('ibc.trusting_period') }}:</td>
              <td>
                {{ formatSeconds(clientState.client_state?.trusting_period) }}
              </td>
            </tr>
            <tr>
              <td class="w-52">{{ $t('ibc.unbonding_period') }}:</td>
              <td>
                {{ formatSeconds(clientState.client_state?.unbonding_period) }}
              </td>
            </tr>
            <tr>
              <td class="w-52">{{ $t('ibc.max_clock_drift') }}:</td>
              <td>
                {{ formatSeconds(clientState.client_state?.max_clock_drift) }}
              </td>
            </tr>
            <tr>
              <td class="w-52">{{ $t('ibc.frozen_height') }}:</td>
              <td>{{ clientState.client_state?.frozen_height }}</td>
            </tr>
            <tr>
              <td class="w-52">{{ $t('ibc.latest_height') }}:</td>
              <td>{{ clientState.client_state?.latest_height }}</td>
            </tr>
          </tbody>
        </table>
        <table class="table table-sm text-sm w-full capitalize table-zebra">
          <thead class="bg-base-200">
            <tr>
              <th colspan="2" class="text-base-content font-semibold">{{ $t('ibc.upgrade_parameters') }}</th>
            </tr>
          </thead>
          <tbody class="text-base-content">
            <tr>
              <td colspan="2">
                <div class="flex justify-between">
                  <span>{{ $t('ibc.allow_update_after_expiry') }}:</span>
                  <span>{{
                    clientState.client_state?.allow_update_after_expiry
                  }}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="flex justify-between">
                  <span>{{ $t('ibc.allow_update_after_misbehaviour') }}: </span>
                  <span>{{
                    clientState.client_state?.allow_update_after_misbehaviour
                  }}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="w-52">{{ $t('ibc.upgrade_path') }}:</td>
              <td class="text-right">
                {{ clientState.client_state?.upgrade_path.join(', ') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="bg-base-100 shadow-md rounded-box px-4 pt-3 pb-4 mb-4 overflow-hidden">
      <h2 class="text-xl font-semibold text-base-content">{{ $t('ibc.channels') }}</h2>
      <div class="overflow-auto">
        <table class="table w-full mt-4 table-zebra">
          <thead class="bg-base-200">
            <tr>
              <th class="text-base-content font-semibold">{{ $t('ibc.txs') }}</th>
              <th style="position: relative; z-index: 2" class="text-base-content font-semibold">
                {{ $t('ibc.channel_id') }}
              </th>
              <th class="text-base-content font-semibold">{{ $t('ibc.port_id') }}</th>
              <th class="text-base-content font-semibold">{{ $t('ibc.state') }}</th>
              <th class="text-base-content font-semibold">{{ $t('ibc.counterparty') }}</th>
              <th class="text-base-content font-semibold">{{ $t('ibc.hops') }}</th>
              <th class="text-base-content font-semibold">{{ $t('ibc.version') }}</th>
              <th class="text-base-content font-semibold">{{ $t('ibc.ordering') }}</th>
            </tr>
          </thead>
          <tbody class="text-base-content">
            <tr v-for="v in channels" :key="v.channel_id">
              <td>
                <div class="flex gap-1">
                  <button
                    class="btn btn-xs btn-primary rounded-btn text-primary-content"
                    @click="fetchSendingTxs(v.channel_id, v.port_id)"
                    :disabled="loading"
                  >
                    <span
                      v-if="loading"
                      class="loading loading-spinner loading-sm"
                    ></span>
                    {{ $t('ibc.btn_out') }}
                  </button>
                  <button
                    class="btn btn-xs btn-primary rounded-btn text-primary-content"
                    @click="fetchRecevingTxs(v.channel_id, v.port_id)"
                    :disabled="loading"
                  >
                    <span
                      v-if="loading"
                      class="loading loading-spinner loading-sm"
                    ></span>
                    {{ $t('ibc.btn_in') }}
                  </button>
                </div>
              </td>
              <td>
                <a href="#" @click="loadChannel(v.channel_id, v.port_id)" class="link link-hover text-primary">{{
                  v.channel_id
                }}</a>
              </td>
              <td>{{ v.port_id }}</td>
              <td>
                <div
                  class="badge badge-outline"
                  :class="`badge-${color(v.state)}`"
                >
                  {{ v.state }}
                </div>
              </td>
              <td>
                {{ v.counterparty?.port_id }}/{{ v.counterparty?.channel_id }}
              </td>
              <td>{{ v.connection_hops.join(', ') }}</td>
              <td>{{ v.version }}</td>
              <td>{{ v.ordering }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="channel_id" class="bg-base-100 shadow-md rounded-box px-4 pt-3 pb-4 mt-4">
      <h3 class="text-xl font-semibold capitalize text-base-content">
        Transactions ({{ channel_id }} {{ port_id }} {{ direction }})
      </h3>
      <div class="overflow-x-auto">
        <table class="table w-full table-zebra">
          <thead class="bg-base-200">
            <tr>
              <th class="text-base-content font-semibold">{{ $t('ibc.height') }}</th>
              <th class="text-base-content font-semibold">{{ $t('ibc.txhash') }}</th>
              <th class="text-base-content font-semibold">{{ $t('ibc.messages') }}</th>
              <th class="text-base-content font-semibold">{{ $t('ibc.time') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(resp, index) in txs?.tx_responses as TxResponse[]" :key="index">
              <td>{{ resp.height }}</td>
              <td>
                <div class="text-sm truncate link link-hover text-primary">
                  <RouterLink
                    :to="`/${chainStore.chainName}/tx/${resp.txhash}`"
                    >{{ resp.txhash }}</RouterLink
                  >
                </div>
              </td>
              <td>
                <div class="flex">
                  {{ format.messages(resp.tx.body.messages) }}
                  <Icon
                    v-if="resp.code === 0"
                    icon="mdi-check"
                    class="text-success text-lg"
                  />
                  <Icon v-else icon="mdi-multiply" class="text-error text-lg" />
                </div>
              </td>
              <td>{{ format.toLocaleDate(resp.timestamp) }}</td>
            </tr>
          </tbody>
        </table>
        <PaginationBar
          :limit="page.limit"
          :total="txs.pagination?.total"
          :callback="pageload"
          class="mt-4"
        />
      </div>
    </div>
  </div>
</template>
