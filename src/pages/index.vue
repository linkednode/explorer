<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import {
  useDashboard,
  LoadingStatus,
  type ChainConfig,
} from '@/stores/useDashboard';
import ChainSummary from '@/components/ChainSummary.vue';
import { computed, ref } from 'vue';
import { useBlockchain } from '@/stores';

const dashboard = useDashboard();

const keywords = ref('');
const chains = computed(() => {
  if (keywords.value) {
    const lowercaseKeywords = keywords.value.toLowerCase();

    return Object.values(dashboard.chains).filter(
      (x: ChainConfig) => x.chainName.toLowerCase().indexOf(lowercaseKeywords) > -1 
      || x.prettyName.toLowerCase().indexOf(lowercaseKeywords) > -1
    );
  } else {
    return Object.values(dashboard.chains);
  }
});

const featured = computed(() => {
  const names = ["cosmos", "osmosis", "akash", "celestia", "evmos", "injective", "dydx", "noble"];
  return chains.value
    .filter(x => names.includes(x.chainName))
    .sort((a, b)=> (names.indexOf(a.chainName) - names.indexOf(b.chainName)))
})

const chainStore = useBlockchain()
</script>
<template>
  <div class="">
    <div class="flex md:!flex-row flex-col items-center justify-center mb-6 mt-14 gap-2">
      <div class="w-16 rounded-full">
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
          width="227.000000pt" height="146.000000pt" viewBox="0 0 227.000000 146.000000"
          preserveAspectRatio="xMidYMid meet">

          <g transform="translate(0.000000,146.000000) scale(0.100000,-0.100000)"
          fill="#000000" stroke="none">
          <path d="M590 1415 c-88 -20 -213 -83 -281 -142 -169 -147 -250 -322 -252
          -548 -1 -132 16 -205 75 -325 79 -161 255 -306 419 -345 205 -48 462 9 600
          133 59 53 163 207 214 317 21 44 43 89 48 100 6 11 19 38 30 60 11 22 21 42
          23 43 1 2 22 -9 46 -26 244 -167 520 -160 643 18 157 226 59 554 -192 641 -50
          17 -76 19 -198 15 -158 -5 -189 -14 -305 -91 -87 -58 -107 -80 -90 -100 25
          -31 -4 -13 -101 60 -108 81 -248 154 -344 180 -87 23 -255 28 -335 10z m210
          -76 c70 -11 142 -30 137 -36 -2 -2 -33 4 -68 14 -100 26 -254 22 -351 -10 -43
          -14 -100 -39 -127 -56 -47 -30 -127 -108 -164 -161 -17 -24 -17 -23 0 9 93
          175 338 278 573 240z m984 -24 c-67 -14 -130 -43 -183 -83 -19 -14 -31 -20
          -27 -13 26 41 176 110 241 110 18 -1 6 -6 -31 -14z m-804 -25 c8 -5 11 -10 5
          -10 -5 0 -17 5 -25 10 -8 5 -10 10 -5 10 6 0 17 -5 25 -10z m45 -20 c3 -6 -1
          -7 -9 -4 -18 7 -21 14 -7 14 6 0 13 -4 16 -10z m-121 -161 c33 -12 86 -37 118
          -56 78 -46 210 -152 203 -163 -3 -5 -12 -7 -20 -4 -9 4 -24 -14 -46 -58 -80
          -160 -169 -275 -253 -330 -72 -47 -36 -41 44 7 50 30 71 51 163 165 15 19 23
          25 18 14 -6 -12 -8 -24 -5 -27 9 -9 -47 -89 -100 -142 -159 -160 -357 -177
          -529 -46 -140 106 -182 303 -102 468 48 98 156 182 236 184 19 0 43 5 54 10
          32 15 155 3 219 -22z m1009 -9 c32 -25 67 -97 67 -136 -1 -46 -35 -111 -69
          -128 -17 -9 -57 -16 -93 -17 -51 -1 -57 -2 -35 -9 30 -9 71 -13 126 -11 26 1
          44 11 78 46 44 44 45 45 41 102 -2 32 -7 67 -11 78 -4 11 2 2 13 -20 27 -56
          25 -93 -9 -147 -41 -64 -79 -82 -155 -75 -75 7 -128 25 -119 40 4 7 0 8 -11 4
          -11 -4 -29 1 -47 14 -16 11 -29 17 -29 13 0 -4 -7 1 -15 12 -8 10 -15 15 -15
          11 0 -5 -12 5 -26 23 l-26 31 27 39 c87 125 235 187 308 130z m-722 -519 c-58
          -81 -189 -176 -271 -195 -14 -4 4 7 40 24 70 33 141 88 204 157 46 50 56 55
          27 14z"/>
          <path d="M715 1105 c-5 -2 -31 -6 -57 -10 -58 -8 -158 -72 -193 -123 -14 -20
          -25 -41 -25 -47 0 -5 7 0 15 13 23 32 92 76 149 95 63 22 202 22 281 2 78 -21
          91 -14 30 17 -73 37 -171 63 -200 53z"/>
          <path d="M2121 616 c-77 -79 -213 -111 -353 -84 -46 9 -92 20 -102 24 -14 5
          -17 4 -12 -4 4 -7 27 -17 51 -23 25 -6 43 -15 40 -19 -2 -4 8 -5 23 -3 19 3
          23 2 14 -5 -33 -23 119 -30 190 -8 57 17 129 66 164 112 35 46 26 52 -15 10z"/>
          </g>
        </svg>
      </div>
      <h1 class="text-primary dark:text-white text-3xl md:!text-6xl font-bold">
        {{ $t('pages.title') }}
      </h1>
    </div>
    <div class="text-center text-base">
      <p class="mb-1">
        {{ $t('pages.slogan') }}
      </p>
    </div>
    <div
      v-if="dashboard.status !== LoadingStatus.Loaded"
      class="flex justify-center"
    >
      <progress class="progress progress-info w-80 h-1"></progress>
    </div>

    <div v-if="featured.length>0" class="text-center text-base mt-6 text-primary">
      <h2 class="mb-6"> Featured Blockchains 🔥 </h2>
    </div>

    <div v-if="featured.length>0"
      class="grid grid-cols-1 gap-4 mt-6 md:!grid-cols-3 lg:!grid-cols-4 2xl:!grid-cols-5"
    >
    <ChainSummary
        v-for="(chain, index) in featured"
        :key="index"
        :name="chain.chainName"
      />
    </div>

    <div class="text-center text-base mt-6 text-primary">
      <h2 class="mb-6">{{ $t('pages.description') }}</h2>
    </div>

    <div class="flex items-center rounded-lg bg-base-100  border border-gray-200 dark:border-gray-700 mt-10">
      <Icon icon="mdi:magnify" class="text-2xl text-gray-400 ml-3"/>
      <input :placeholder="$t('pages.search_placeholder')" class="px-4 h-10 bg-transparent flex-1 outline-none text-base" v-model="keywords" />
      <div class="px-4 text-base hidden md:!block">{{ chains.length }}/{{ dashboard.length }}</div>
    </div>

    <div
      class="grid grid-cols-1 gap-4 mt-6 md:!grid-cols-3 lg:!grid-cols-4 2xl:!grid-cols-5"
    >
      <ChainSummary
        v-for="(chain, index) in chains"
        :key="index"
        :name="chain.chainName"
      />
    </div>
  </div>
</template>

<style scoped>
 .logo path{
  fill: #171d30;
}
</style>
