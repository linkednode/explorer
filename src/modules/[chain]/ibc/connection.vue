<script lang="ts" setup>
import { useBlockchain } from '@/stores';
import { PageRequest, type Connection, type Pagination } from '@/types';
import { onMounted } from 'vue';
import { ref } from 'vue';

import { useIBCModule } from './connStore';

const props = defineProps(['chain']);
const chainStore = useBlockchain();
const ibcStore = useIBCModule();
const list = ref([] as Connection[]);
const pageRequest = ref(new PageRequest());
const pageResponse = ref({} as Pagination);
const tab = ref('registry');

onMounted(() => {
  pageload(1);
  ibcStore.load();
});

function pageload(p: number) {
  pageRequest.value.setPage(p);
  chainStore.rpc.getIBCConnections(pageRequest.value).then((x) => {
    list.value = x.connections;
    pageResponse.value = x.pagination;
    if (x.pagination.total && Number(x.pagination.total) > 0) {
      ibcStore.showConnection(list.value[0].id);
    }
  });
}
</script>
<template>
  <div>
    <div class="bg-base-100 shadow-md rounded-box px-4 pt-3 pb-4">
      <div class="flex flex-wrap gap-4 items-center">
        <h2 class="text-xl font-semibold py-4 text-base-content">{{ $t('ibc.title') }}</h2>
        <div class="tabs tabs-boxed bg-base-200 rounded-box">
          <a
            role="tab"
            class="tab text-neutral-content uppercase"
            :class="{ 'tab-active': tab === 'registry' }"
            @click="tab = 'registry'"
            >{{ $t('ibc.registry') }}</a
          >
          <a
            role="tab"
            class="tab text-neutral-content uppercase"
            :class="{ 'tab-active': tab === 'favorite' }"
            @click="tab = 'favorite'"
            >{{ $t('module.favorite') }}</a
          >
        </div>
      </div>
      <div>
        <div v-show="tab === 'registry'" class="flex flex-wrap gap-1 p-4">
          <span
            v-for="(s, i) in ibcStore.info"
            :key="i"
            class="btn btn-xs btn-outline btn-primary rounded-btn mr-1 text-primary-content"
            @click="ibcStore.fetchConnection(i)"
            >{{
              s.chain_1.chain_name === ibcStore.chainName
                ? s.chain_2.chain_name
                : s.chain_1.chain_name
            }}
            &#x21cc;
            {{
              s.chain_1.chain_name === ibcStore.chainName
                ? s.chain_1.chain_name
                : s.chain_2.chain_name
            }}</span
          >
        </div>
        <div v-show="tab === 'favorite'" class="flex flex-wrap gap-1 p-4">
          <div class="join border border-primary rounded-box">
            <button class="join-item px-2 text-base-content">
              {{ $t('ibc.connection_id') }}:
            </button>
            <input
              v-model="ibcStore.connectionId"
              type="number"
              class="input input-bordered w-40 join-item text-base-content"
              min="0"
              :max="pageResponse.total || 0"
              :placeholder="`0~${pageResponse.total}`"
            />
            <button
              class="join-item btn btn-primary text-primary-content"
              @click="ibcStore.showConnection()"
            >
              {{ $t('ibc.btn_apply') }}
            </button>
          </div>
        </div>
      </div>
      <div class="overflow-auto mt-5">
        <router-view :key="$route.fullPath"></router-view>
      </div>
    </div>
  </div>
</template>
