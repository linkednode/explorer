<script lang="ts" setup>
import { computed, ref } from '@vue/reactivity';
import { useBaseStore, useBlockchain, useFormatter } from '@/stores';
import { PageRequest, type AuthAccount, type Pagination } from '@/types';
import { onMounted } from 'vue';
import PaginationBar from '@/components/PaginationBar.vue';
const props = defineProps(['chain']);

const chainStore = useBlockchain();

const accounts = ref([] as AuthAccount[]);
const pageRequest = ref(new PageRequest());
const pageResponse = ref({} as Pagination);

onMounted(() => {
  pageload(1);
});

function pageload(p: number) {
  pageRequest.value.setPage(p);
  chainStore.rpc.getAuthAccounts(pageRequest.value).then((x) => {
    accounts.value = x.accounts;
    pageResponse.value = x.pagination;
  });
}

function showType(v: string) {
  return v.replace('/cosmos.auth.v1beta1.', '');
}
function findField(v: any, field: string) {
  if (!v || Array.isArray(v) || typeof v === 'string') return null;
  const fields = Object.keys(v);
  if (fields.includes(field)) {
    return v[field];
  }
  for (let i = 0; i < fields.length; i++) {
    const re: any = findField(v[fields[i]], field);
    if (re) return re;
  }
}
function showAddress(v: any) {
  return findField(v, 'address');
}
function showAccountNumber(v: any) {
  return findField(v, 'account_number');
}
function showSequence(v: any) {
  return findField(v, 'sequence');
}
function showPubkey(v: any) {
  return findField(v, 'pub_key');
}
</script>
<template>
  <div class="bg-base-100 shadow-md rounded-box p-4">
    <div class="overflow-x-auto">
      <table class="table table-compact w-full table-zebra">
        <thead>
          <tr>
            <th class="text-base-content font-semibold">{{ $t('account.type') }}</th>
            <th class="text-base-content font-semibold">{{ $t('account.address') }}</th>
            <th class="text-base-content font-semibold">{{ $t('account.acc_num') }}</th>
            <th class="text-base-content font-semibold">{{ $t('account.sequence') }}</th>
            <th class="text-base-content font-semibold">{{ $t('account.pub_key') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="acc in accounts" :key="showAddress(acc)">
            <td class="text-base-content">{{ showType(acc['@type']) }}</td>
            <td>
              <RouterLink :to="`/${chain}/account/${showAddress(acc)}`" class="link link-hover text-primary">{{ showAddress(acc) }}</RouterLink>
            </td>
            <td class="text-base-content">{{ showAccountNumber(acc) }}</td>
            <td class="text-base-content">{{ showSequence(acc) }}</td>
            <td class="text-base-content">{{ showPubkey(acc) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <PaginationBar :limit="pageRequest.limit" :total="pageResponse.total" :callback="pageload" class="mt-4" />
  </div>
</template>
