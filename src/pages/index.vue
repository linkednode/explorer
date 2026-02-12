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
  <div class="animate-fade-in">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-base-100 to-primary/5 p-8 md:p-12 mb-8">
      <!-- Background decoration -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div class="relative flex md:!flex-row flex-col items-center justify-center gap-4">
        <div class="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow p-3">
          <svg
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 150.000000 132.000000"
            preserveAspectRatio="xMidYMid meet"
            class="w-full h-full"
          >
            <g
              transform="translate(0.000000,132.000000) scale(0.100000,-0.100000)"
              fill="white"
              stroke="none"
            >
              <path
                d="M500 1310 l-125 -5 -182 -315 c-100 -173 -182 -321 -182 -329 -1 -7
              81 -159 181 -337 l183 -324 372 0 371 0 186 325 c102 179 186 330 186 337 0 7
              -82 157 -182 335 l-183 323 -250 -2 c-137 -1 -306 -5 -375 -8z m588 -454 c61
              -106 112 -197 112 -201 0 -4 -50 -95 -111 -201 l-112 -194 -231 0 -231 0 -105
              181 c-58 100 -109 190 -114 200 -6 14 17 63 104 213 l112 196 232 0 231 0 113
              -194z"
              />
              <path
                d="M591 1001 l-54 -6 -87 -150 -88 -150 176 -3 c97 -1 181 -1 187 2 9 3
              165 267 183 308 4 9 -233 7 -317 -1z"
              />
              <path
                d="M872 824 l-90 -159 36 -66 c113 -201 147 -258 153 -251 8 8 179 302
              179 307 0 2 -37 68 -83 147 -46 78 -88 151 -94 162 -9 16 -24 -5 -101 -140z"
              />
              <path
                d="M360 625 c0 -7 148 -263 172 -297 l19 -28 186 0 c101 0 183 3 181 8
              -1 4 -43 78 -93 165 l-90 157 -187 0 c-104 0 -188 -2 -188 -5z"
              />
            </g>
          </svg>
        </div>
        <div class="text-center md:text-left">
          <h1 class="text-3xl md:!text-5xl lg:!text-6xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
            {{ $t('pages.title') }}
          </h1>
          <p class="mt-2 text-base md:text-lg text-base-content/70 max-w-xl">
            {{ $t('pages.slogan') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="dashboard.status !== LoadingStatus.Loaded" class="flex justify-center mb-8">
      <div class="flex items-center gap-3 px-6 py-3 bg-base-100 rounded-xl shadow-soft">
        <span class="loading loading-spinner loading-sm text-primary"></span>
        <span class="text-sm text-base-content/70">Loading chains...</span>
      </div>
    </div>

    <!-- Featured Section -->
    <div v-if="featured.length > 0" class="mb-10">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10 flex items-center justify-center">
          <span class="text-xl">🔥</span>
        </div>
        <div>
          <h2 class="text-xl font-bold text-base-content">Featured Blockchains</h2>
          <p class="text-sm text-base-content/60">Popular networks in the ecosystem</p>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-4 md:!grid-cols-3 lg:!grid-cols-4 2xl:!grid-cols-5">
        <ChainSummary v-for="(chain, index) in featured" :key="index" :name="chain.chainName" :featured="true" />
      </div>
    </div>

    <!-- All Chains Section -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <Icon icon="mdi:view-grid" class="text-xl text-primary" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-base-content">{{ $t('pages.description') }}</h2>
          <p class="text-sm text-base-content/60">Browse and explore blockchain networks</p>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="relative mb-8">
      <div class="flex items-center bg-base-100 rounded-xl border border-base-300/50 shadow-soft overflow-hidden transition-all duration-200 focus-within:border-primary/50 focus-within:shadow-glow/20">
        <div class="pl-4 pr-2">
          <Icon icon="mdi:magnify" class="text-xl text-base-content/40" />
        </div>
        <input
          :placeholder="$t('pages.search_placeholder')"
          class="px-2 py-3.5 bg-transparent flex-1 outline-none text-base text-base-content placeholder-base-content/40"
          v-model="keywords"
        />
        <div class="px-4 py-2 bg-base-200/50 text-sm text-base-content/60 font-medium hidden md:!flex items-center gap-1">
          <span class="text-primary font-semibold">{{ chains.length }}</span>
          <span>/</span>
          <span>{{ dashboard.length }}</span>
        </div>
      </div>
    </div>

    <!-- Chains Grid -->
    <div class="grid grid-cols-1 gap-4 md:!grid-cols-3 lg:!grid-cols-4 2xl:!grid-cols-5">
      <ChainSummary 
        v-for="(chain, index) in chains" 
        :key="index" 
        :name="chain.chainName"
        class="animate-fade-in-up"
        :style="{ animationDelay: `${Math.min(index * 30, 300)}ms` }"
      />
    </div>

    <!-- Empty State -->
    <div v-if="chains.length === 0 && dashboard.status === LoadingStatus.Loaded" class="text-center py-16">
      <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-base-200 flex items-center justify-center">
        <Icon icon="mdi:magnify-close" class="text-4xl text-base-content/30" />
      </div>
      <h3 class="text-lg font-semibold text-base-content mb-2">No chains found</h3>
      <p class="text-base-content/60">Try adjusting your search terms</p>
    </div>
  </div>
</template>

<style scoped>
.logo path {
  fill: hsl(var(--p));
}
</style>
@/components/ad/ad
