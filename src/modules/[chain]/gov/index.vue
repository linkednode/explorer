<script lang="ts" setup>
import { useGovStore, LoadingStatus } from '@/stores'; // Re-add LoadingStatus
import ProposalListItem from '@/components/ProposalListItem.vue';
import { ref, onMounted } from 'vue';
import PaginationBar from '@/components/PaginationBar.vue';
import { PageRequest } from '@/types';

const tab = ref('2');
const store = useGovStore();
const pageRequest = ref(new PageRequest());

onMounted(async () => {
  // Initially fetch proposals for the default tab ('2' - voting)
  await store.fetchProposals(tab.value);
  // If no proposals in 'voting', try 'passed'
  if (store.proposals['2']?.proposals?.length === 0) {
    tab.value = '3';
    await store.fetchProposals(tab.value);
    // If no proposals in 'passed', try 'rejected'
    if (store.proposals['3']?.proposals?.length === 0) {
      tab.value = '4';
      await store.fetchProposals(tab.value);
    }
  }
});

const changeTab = async (val: '2' | '3' | '4') => {
  tab.value = val;
  await store.fetchProposals(tab.value, pageRequest.value);
};

function page(p: number) {
  pageRequest.value.setPage(p);
  store.fetchProposals(tab.value, pageRequest.value);
}
</script>
<template>
  <div class="container mx-auto px-4 py-8">
    <div class="card bg-base-100 shadow-xl rounded-box p-6">
      <div class="tabs tabs-boxed bg-base-200 mb-6 p-1 rounded-lg flex justify-center">
        <a
          class="tab tab-lg flex-1 font-semibold"
          :class="{ 'tab-active tab-primary': tab === '2' }"
          @click="changeTab('2')"
        >
          {{ $t('gov.voting') }}
        </a>
        <a
          class="tab tab-lg flex-1 font-semibold"
          :class="{ 'tab-active tab-primary': tab === '3' }"
          @click="changeTab('3')"
        >
          {{ $t('gov.passed') }}
        </a>
        <a
          class="tab tab-lg flex-1 font-semibold"
          :class="{ 'tab-active tab-primary': tab === '4' }"
          @click="changeTab('4')"
        >
          {{ $t('gov.rejected') }}
        </a>
      </div>

      <div v-if="store.loading[tab] === LoadingStatus.Loading" class="flex justify-center items-center h-64">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
      <div v-else-if="store?.proposals[tab]?.proposals?.length === 0" class="text-center py-10 text-neutral-content">
        <p class="text-lg">No proposals found for this status.</p>
        <p class="text-sm mt-2">Please check other tabs or try again later.</p>
      </div>
      <div v-else>
        <ProposalListItem :proposals="store?.proposals[tab]" />
        <div class="mt-6">
          <PaginationBar :total="store?.proposals[tab]?.pagination?.total" :limit="pageRequest.limit" :callback="page" />
        </div>
      </div>
    </div>
  </div>
</template>
<route>
  {
    meta: {
      i18n: 'governance',
      order: 2
    }
  }
</route>
