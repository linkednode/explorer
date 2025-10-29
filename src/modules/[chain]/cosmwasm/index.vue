<script lang="ts" setup>
import { useBlockchain, useFormatter, useTxDialog } from '@/stores';
import { useWasmStore } from './WasmStore';
import { onMounted, ref } from 'vue';
import type { PaginabledCodeInfos } from './types';
import { PageRequest } from '@/types';
import PaginationBar from '@/components/PaginationBar.vue';
import router from '@/router';

const props = defineProps(['chain']);

const codes = ref({} as PaginabledCodeInfos);

const pageRequest = ref(new PageRequest());
const wasmStore = useWasmStore();
const dialog = useTxDialog();
const creator = ref('');
const field = ref('contract');
const history = ref([]);

function pageload(pageNum: number) {
  pageRequest.value.setPage(pageNum);
  wasmStore.wasmClient.getWasmCodeList(pageRequest.value).then((x) => {
    codes.value = x;
  });
}
pageload(1);

onMounted(() => {
  const historyStore = JSON.parse(localStorage.getItem('contract_history') || '{}');
  history.value = historyStore[props.chain] || [];
});

function myContracts() {
  if (field.value === 'contract') router.push(`/${props.chain}/cosmwasm/0/transactions?contract=${creator.value}`);
  else if (field.value === 'creator') router.push(`/${props.chain}/cosmwasm/${creator.value}/contracts`);
}
const togo = ref('');
function gotoHistory() {
  router.push(`/${props.chain}/cosmwasm/0/transactions?contract=${togo.value}`);
}
</script>
<template>
  <div class="bg-base-100 shadow-md rounded-box px-4 pt-3 pb-4 mb-4">
    <h2 class="text-xl font-semibold truncate w-full mb-4 text-base-content">{{ $t('cosmwasm.title') }}</h2>
    <div class="grid grid-flow-col auto-cols-max gap-4 overflow-hidden">
      <div class="join w-full border border-primary rounded-box">
        <select v-model="field" class="select select-bordered select-primary text-base-content">
          <option value="contract">Contract</option>
          <option value="creator">Creator</option>
        </select>
        <input v-model="creator" type="text" class="input input-bordered w-full join-item text-base-content" placeholder="address" />
        <button class="join-item btn btn-primary text-primary-content" @click="myContracts()">{{ $t('cosmwasm.btn_query') }}</button>
      </div>
      <div>
        <select v-model="togo" class="select select-bordered w-full text-base-content" @change="gotoHistory()">
          <option value="">History</option>
          <option v-for="(v, index) in history" :key="index" :value="v">...{{ String(v).substring(45) }}</option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="table table-compact w-full mt-4 text-sm table-zebra">
        <thead>
          <tr>
            <th class="bg-base-200 text-base-content font-semibold">{{ $t('cosmwasm.code_id') }}</th>
            <th class="bg-base-200 text-base-content font-semibold">{{ $t('cosmwasm.code_hash') }}</th>
            <th class="bg-base-200 text-base-content font-semibold">{{ $t('cosmwasm.creator') }}</th>
            <th class="bg-base-200 text-base-content font-semibold">{{ $t('cosmwasm.permissions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(v, index) in codes.code_infos" :key="index">
            <td class="text-base-content">{{ v.code_id }}</td>
            <td>
              <RouterLink
                :to="`/${props.chain}/cosmwasm/${v.code_id}/contracts`"
                class="truncate max-w-[200px] block link link-hover text-primary"
                :title="v.data_hash"
              >
                {{ v.data_hash }}
              </RouterLink>
            </td>
            <td class="text-base-content">{{ v.creator }}</td>
            <td class="text-base-content">
              {{ v.instantiate_permission?.permission }}
              <span>{{ v.instantiate_permission?.address }} {{ v.instantiate_permission?.addresses.join(', ') }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-between">
        <PaginationBar :limit="pageRequest.limit" :total="codes.pagination?.total" :callback="pageload" class="mt-4" />
        <label for="wasm_store_code" class="btn btn-primary my-5 text-primary-content" @click="dialog.open('wasm_store_code', {})">{{
          $t('cosmwasm.btn_up_sc')
        }}</label>
      </div>
    </div>
  </div>
</template>

<route>
    {
      meta: {
        i18n: 'cosmwasm'
      }
    }
</route>
