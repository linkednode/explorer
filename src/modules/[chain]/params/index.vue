<script lang="ts" setup>
import { useParamStore } from '@/stores';
import { ref, onMounted } from 'vue';
import CardParameter from '@/components/CardParameter.vue';
import ArrayObjectElement from '@/components/dynamic/ArrayObjectElement.vue';
const store = useParamStore();
const chain = ref(store.chain);
onMounted(() => {
  // fetch the data
  store.initial();
});
</script>
<template>
  <div class="overflow-hidden">
    <!-- Chain ID -->
    <div class="bg-base-100 shadow-md rounded-box px-4 pt-3 pb-4 mb-4">
      <div class="text-xl font-semibold mb-3 text-base-content">{{ chain.title }}</div>
      <div class="grid grid-cols-2 md:!grid-cols-4 lg:!grid-cols-5 2xl:!grid-cols-6 gap-4">
        <div v-for="(item, index) of chain.items" :key="index" class="rounded-md bg-base-200 px-4 py-2">
          <div class="text-sm mb-1 text-neutral-content">{{ item.subtitle }}</div>
          <div class="text-base font-medium text-base-content">{{ item.value }}</div>
        </div>
      </div>
    </div>
    <!-- minting Parameters  -->
    <CardParameter :cardItem="store.mint" />
    <!-- Staking Parameters  -->
    <CardParameter :cardItem="store.staking" />
    <!-- Governance Parameters -->
    <CardParameter :cardItem="store.gov" />
    <!-- Distribution Parameters -->
    <CardParameter :cardItem="store.distribution" />
    <!-- Slashing Parameters -->
    <CardParameter :cardItem="store.slashing" />
    <!-- Application Version -->
    <div class="bg-base-100 shadow-md rounded-box px-4 pt-3 pb-4 mt-6">
      <div class="text-xl font-semibold mb-3 text-base-content">{{ store.appVersion?.title }}</div>
      <ArrayObjectElement :value="store.appVersion?.items" :thead="false" />
    </div>

    <!-- Node Information -->
    <div class="bg-base-100 shadow-md rounded-box px-4 pt-3 pb-4 mt-6">
      <div class="text-xl font-semibold mb-3 text-base-content">{{ store.nodeVersion?.title }}</div>
      <ArrayObjectElement :value="store.nodeVersion?.items" :thead="false" />
    </div>
  </div>
</template>

<route>
{
  meta: {
    i18n: 'parameters',
    order: 50
  }
}
</route>
