<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { useDashboard, LoadingStatus } from '@/stores';
import type { ChainConfig } from '@/types/chaindata';
import ChainSummary from '@/components/ChainSummary.vue';
import AdBanner from '@/components/ad/AdBanner.vue';

import { computed, onMounted, ref } from 'vue';
import { useBlockchain } from '@/stores';

const dashboard = useDashboard();

const keywords = ref('');
const chains = computed(() => {
  if (keywords.value) {
    const lowercaseKeywords = keywords.value.toLowerCase();

    return Object.values(dashboard.chains).filter(
      (x: ChainConfig) =>
        x.chainName.toLowerCase().indexOf(lowercaseKeywords) > -1 ||
        x.prettyName.toLowerCase().indexOf(lowercaseKeywords) > -1
    );
  } else {
    return Object.values(dashboard.chains);
  }
});

const featured = computed(() => {
  const names = ['cosmos', 'osmosis', 'akash', 'celestia', 'evmos', 'injective', 'dydx', 'noble'];
  return chains.value
    .filter((x) => names.includes(x.chainName))
    .sort((a, b) => names.indexOf(a.chainName) - names.indexOf(b.chainName));
});

const chainStore = useBlockchain();
</script>
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Hero Section -->
    <div class="text-center mb-12 bg-base-100 p-8 rounded-box shadow-xl">
      <div class="flex flex-col items-center justify-center mb-6">
        <div class="w-24 h-24 mb-4">
          <img src="../assets/logo.svg" alt="LinkedNode Logo" class="w-full h-full object-contain animate-bounce-slow" />
        </div>
        <h1 class="text-5xl md:text-7xl font-extrabold text-primary mb-3 leading-tight">
          {{ $t('pages.title') }}
        </h1>
        <p class="text-lg text-neutral-content max-w-2xl mx-auto">
          {{ $t('pages.slogan') }}
        </p>
      </div>
      <div v-if="dashboard.status !== LoadingStatus.Loaded" class="flex justify-center mt-6">
        <progress class="progress progress-primary w-96 h-2"></progress>
      </div>
    </div>

    <!-- Featured Blockchains Section -->
    <div v-if="featured.length > 0" class="mb-12">
      <h2 class="text-3xl font-bold text-center text-base-content mb-8">Featured Blockchains 🔥</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ChainSummary v-for="(chain, index) in featured" :key="index" :name="chain.chainName" class="transform hover:scale-105 transition-transform duration-200" />
      </div>
    </div>

    <!-- Search and All Blockchains Section -->
    <div class="bg-base-100 p-8 rounded-box shadow-xl">
      <h2 class="text-3xl font-bold text-center text-base-content mb-8">{{ $t('pages.description') }}</h2>

      <div class="form-control mb-8">
        <div class="input-group justify-center">
          <input
            type="text"
            :placeholder="$t('pages.search_placeholder')"
            class="input input-bordered input-primary w-full max-w-md"
            v-model="keywords"
          />
          <button class="btn btn-primary">
            <Icon icon="mdi:magnify" class="text-2xl" />
          </button>
        </div>
        <div class="text-center text-sm text-neutral-content mt-2">
          {{ chains.length }} / {{ dashboard.length }} {{ $t('pages.chains_found') }}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ChainSummary v-for="(chain, index) in chains" :key="index" :name="chain.chainName" class="transform hover:scale-105 transition-transform duration-200" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-bounce-slow {
  animation: bounce-slow 3s infinite ease-in-out;
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
</style>
