<script lang="ts" setup>
import MdEditor from 'md-editor-v3';
import PriceMarketChart from '@/components/charts/PriceMarketChart.vue';

import { Icon } from '@iconify/vue';
import { useBlockchain, useFormatter, useTxDialog, useWalletStore, useStakingStore, useParamStore } from '@/stores';
import { onMounted, ref } from 'vue';
import { useIndexModule, colorMap, tickerUrl } from './indexStore';
import { computed } from '@vue/reactivity';

import CardStatisticsVertical from '@/components/CardStatisticsVertical.vue';
import ProposalListItem from '@/components/ProposalListItem.vue';
import ArrayObjectElement from '@/components/dynamic/ArrayObjectElement.vue';

const props = defineProps(['chain']);

const blockchain = useBlockchain();
const store = useIndexModule();
const walletStore = useWalletStore();
const format = useFormatter();
const dialog = useTxDialog();
const stakingStore = useStakingStore();
const paramStore = useParamStore();
const coinInfo = computed(() => {
  return store.coinInfo;
});

onMounted(() => {
  store.loadDashboard();
  walletStore.loadMyAsset();
  paramStore.handleAbciInfo();
  // if(!(coinInfo.value && coinInfo.value.name)) {
  // }
});
const ticker = computed(() => store.coinInfo.tickers[store.tickerIndex]);

const currName = ref('');
blockchain.$subscribe((m, s) => {
  if (s.chainName !== currName.value) {
    currName.value = s.chainName;
    store.loadDashboard();
    walletStore.loadMyAsset();
    paramStore.handleAbciInfo();
  }
});
function shortName(name: string, id: string) {
  return name.toLowerCase().startsWith('ibc/') || name.toLowerCase().startsWith('0x') ? id : name;
}

const comLinks = computed(() => {
  return [
    {
      name: 'Website',
      icon: 'mdi-web',
      href: store.homepage,
    },
    {
      name: 'Twitter',
      icon: 'mdi-twitter',
      href: store.twitter,
    },
    {
      name: 'Telegram',
      icon: 'mdi-telegram',
      href: store.telegram,
    },
    {
      name: 'Github',
      icon: 'mdi-github',
      href: store.github,
    },
  ];
});

// wallet box
const change = computed(() => {
  const token = walletStore.balanceOfStakingToken;
  return token ? format.priceChanges(token.denom) : 0;
});
const color = computed(() => {
  switch (true) {
    case change.value > 0:
      return 'text-green-600';
    case change.value === 0:
      return 'text-grey-500';
    case change.value < 0:
      return 'text-red-600';
  }
});

function updateState() {
  walletStore.loadMyAsset();
}

function trustColor(v: string) {
  return `text-${colorMap(v)}`;
}

const quantity = ref(100);
const qty = computed({
  get: () => {
    return parseFloat(quantity.value.toFixed(6));
  },
  set: (val) => {
    quantity.value = val;
  },
});
const amount = computed({
  get: () => {
    return quantity.value * ticker.value.converted_last.usd || 0;
  },
  set: (val) => {
    quantity.value = val / ticker.value.converted_last.usd || 0;
  },
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="coinInfo && coinInfo.name" class="card bg-base-100 shadow-xl rounded-box p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-1">
          <div class="flex items-center gap-3 mb-4">
            <img :src="coinInfo.image?.large" alt="Coin Logo" class="w-12 h-12 rounded-full" v-if="coinInfo.image?.large" />
            <div>
              <h2 class="text-2xl font-bold text-base-content">
                {{ coinInfo.name }} (<span class="uppercase">{{ coinInfo.symbol }}</span
                >)
              </h2>
              <div class="text-sm text-neutral-content mt-1">
                {{ $t('index.rank') }}:
                <div class="badge badge-error badge-outline ml-1">
                  #{{ coinInfo.market_cap_rank }}
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 mb-6">
            <a
              v-for="(item, index) of comLinks"
              :key="index"
              :href="item.href"
              target="_blank"
              class="btn btn-sm btn-outline btn-primary gap-2"
              v-if="item.href"
            >
              <Icon :icon="item?.icon" class="text-lg" />
              <span class="uppercase">{{ item?.name }}</span>
            </a>
          </div>

          <div class="dropdown dropdown-hover w-full mb-6">
            <label tabindex="0" class="btn btn-outline btn-primary w-full justify-between">
              <div>
                <div class="font-semibold text-lg text-base-content">
                  {{ ticker?.market?.name || '' }}
                </div>
                <div class="text-info text-sm">
                  {{ shortName(ticker?.base, ticker?.coin_id) }}/{{
                    shortName(ticker?.target, ticker?.target_coin_id)
                  }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-base-content">
                  ${{ ticker?.converted_last?.usd }}
                </div>
                <div class="text-sm" :class="store.priceColor">{{ store.priceChange }}%</div>
              </div>
            </label>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-full max-h-64 overflow-y-auto mt-1">
              <li
                v-for="(item, index) in store.coinInfo.tickers"
                :key="index"
                @click="store.selectTicker(index)"
              >
                <a class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="text-base-content text-sm" :class="trustColor(item.trust_score)">
                      {{ item?.market?.name }}
                    </div>
                    <div class="text-sm text-neutral-content">
                      {{ shortName(item?.base, item?.coin_id) }}/{{
                        shortName(item?.target, item?.target_coin_id)
                      }}
                    </div>
                  </div>
                  <div class="text-base text-base-content">${{ item?.converted_last?.usd }}</div>
                </a>
              </li>
            </ul>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <label class="btn btn-primary flex-1" for="calculator">
              <Icon icon="mdi:calculator-variant-outline" class="text-2xl" />
              <span>{{ $t('index.price_calculator') }}</span>
            </label>
            <input type="checkbox" id="calculator" class="modal-toggle" />
            <div class="modal">
              <div class="modal-box bg-base-100 shadow-xl rounded-box p-6">
                <h3 class="font-bold text-2xl text-base-content mb-4">
                  {{ $t('index.price_calculator') }}
                </h3>
                <div class="flex flex-col w-full gap-4">
                  <div class="join w-full">
                    <label class="btn join-item btn-primary">
                      <span class="uppercase">{{ coinInfo.symbol }}</span>
                    </label>
                    <input
                      type="number"
                      v-model="qty"
                      min="0"
                      placeholder="Input a number"
                      class="input input-bordered join-item flex-grow input-primary"
                    />
                  </div>
                  <div class="divider">=</div>
                  <div class="join w-full">
                    <label class="btn join-item btn-primary">
                      <span>USD</span>
                    </label>
                    <input
                      type="number"
                      v-model="amount"
                      min="0"
                      placeholder="Input amount"
                      class="input input-bordered join-item flex-grow input-primary"
                    />
                  </div>
                </div>
                <div class="modal-action">
                  <label for="calculator" class="btn btn-ghost">{{ $t('index.close') }}</label>
                </div>
              </div>
            </div>
            <a
              class="btn flex-1"
              :class="{ 'btn-success': store.priceChange > 0, 'btn-error': store.priceChange < 0, 'btn-info': store.priceChange === 0 }"
              :href="tickerUrl(ticker.trade_url)"
              target="_blank"
              v-if="ticker?.trade_url"
            >
              {{ $t('index.buy') }} {{ coinInfo.symbol || '' }}
            </a>
          </div>
        </div>

        <div class="md:col-span-2">
          <PriceMarketChart class="h-full" />
        </div>
      </div>

      <div class="divider my-6"></div>

      <div class="p-4 text-base-content">
        <h3 class="text-xl font-semibold mb-3">{{ $t('index.description') }}</h3>
        <div class="prose max-w-none text-neutral-content">
          <!-- @ts-ignore -->
          <MdEditor :model-value="coinInfo.description?.en" previewOnly></MdEditor>
        </div>
      </div>

      <div class="divider my-6"></div>

      <div class="mx-4 flex flex-wrap gap-2">
        <div
          v-for="tag in coinInfo.categories"
          :key="tag"
          class="badge badge-outline badge-primary"
        >
          {{ tag }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mt-6">
      <div v-for="(item, key) in store.stats" :key="key">
        <CardStatisticsVertical v-bind="item" />
      </div>
    </div>

    <div
      v-if="blockchain.supportModule('governance')"
      class="card bg-base-100 shadow-xl rounded-box p-6 mt-6"
    >
      <h2 class="text-2xl font-bold text-base-content mb-4">{{ $t('index.active_proposals') }}</h2>
      <ProposalListItem :proposals="store?.proposals" />
      <div
        class="py-8 text-center text-neutral-content"
        v-if="store.proposals?.proposals?.length === 0"
      >
        {{ $t('index.no_active_proposals') }}
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl rounded-box p-6 mt-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 class="text-2xl font-bold text-base-content">
          <span class="truncate">{{ walletStore.currentAddress || 'Not Connected' }}</span>
        </h2>
        <RouterLink
          v-if="walletStore.currentAddress"
          class="btn btn-sm btn-outline btn-primary mt-2 sm:mt-0"
          :to="`/${chain}/account/${walletStore.currentAddress}`"
        >
          {{ $t('index.more') }}
        </RouterLink>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="card bg-base-200 shadow-md rounded-box p-4">
          <div class="text-sm text-neutral-content mb-1">{{ $t('account.balance') }}</div>
          <div class="text-xl font-bold text-base-content">
            {{ format.formatToken(walletStore.balanceOfStakingToken) }}
          </div>
          <div class="text-sm" :class="color">${{ format.tokenValue(walletStore.balanceOfStakingToken) }}</div>
        </div>
        <div class="card bg-base-200 shadow-md rounded-box p-4">
          <div class="text-sm text-neutral-content mb-1">{{ $t('module.staking') }}</div>
          <div class="text-xl font-bold text-base-content">
            {{ format.formatToken(walletStore.stakingAmount) }}
          </div>
          <div class="text-sm" :class="color">${{ format.tokenValue(walletStore.stakingAmount) }}</div>
        </div>
        <div class="card bg-base-200 shadow-md rounded-box p-4">
          <div class="text-sm text-neutral-content mb-1">{{ $t('index.reward') }}</div>
          <div class="text-xl font-bold text-base-content">
            {{ format.formatToken(walletStore.rewardAmount) }}
          </div>
          <div class="text-sm" :class="color">${{ format.tokenValue(walletStore.rewardAmount) }}</div>
        </div>
        <div class="card bg-base-100 shadow-md rounded-box p-4">
          <div class="text-sm text-neutral-content mb-1">{{ $t('index.unbonding') }}</div>
          <div class="text-xl font-bold text-base-content">
            {{ format.formatToken(walletStore.unbondingAmount) }}
          </div>
          <div class="text-sm" :class="color">${{ format.tokenValue(walletStore.unbondingAmount) }}</div>
        </div>
      </div>

      <div
        v-if="walletStore.delegations.length > 0"
        class="overflow-x-auto mb-6"
      >
        <table class="table w-full">
          <thead>
            <tr>
              <th>{{ $t('account.validator') }}</th>
              <th>{{ $t('account.delegations') }}</th>
              <th>{{ $t('account.rewards') }}</th>
              <th class="text-center">{{ $t('staking.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in walletStore.delegations" :key="index" class="hover:bg-base-200">
              <td>
                <RouterLink
                  class="link link-hover text-primary font-semibold"
                  :to="`/${chain}/staking/${item?.delegation?.validator_address}`"
                >
                  {{ format.validatorFromBech32(item?.delegation?.validator_address) }}
                </RouterLink>
              </td>
              <td>{{ format.formatToken(item?.balance) }}</td>
              <td>
                {{
                  format.formatTokens(
                    walletStore?.rewards?.rewards?.find(
                      (el) => el?.validator_address === item?.delegation?.validator_address
                    )?.reward
                  )
                }}
              </td>
              <td class="text-center">
                <div class="flex justify-center gap-2">
                  <label
                    for="delegate"
                    class="btn btn-sm btn-primary"
                    @click="
                      dialog.open('delegate', { validator_address: item.delegation.validator_address }, updateState)
                    "
                  >
                    {{ $t('account.btn_delegate') }}
                  </label>
                  <label
                    for="withdraw"
                    class="btn btn-sm btn-success"
                    @click="
                      dialog.open('withdraw', { validator_address: item.delegation.validator_address }, updateState)
                    "
                  >
                    {{ $t('index.btn_withdraw_reward') }}
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label for="PingTokenConvert" class="btn btn-primary">{{ $t('index.btn_swap') }}</label>
        <label for="send" class="btn btn-success" @click="dialog.open('send', {}, updateState)">{{
          $t('account.btn_send')
        }}</label>
        <label
          for="delegate"
          class="btn btn-info"
          @click="dialog.open('delegate', {}, updateState)"
          >{{ $t('account.btn_delegate') }}</label
        >
        <RouterLink to="/wallet/receive" class="btn btn-info hidden">{{
          $t('index.receive')
        }}</RouterLink>
      </div>
      <Teleport to="body">
        <ping-token-convert
          :chain-name="blockchain?.current?.prettyName"
          :endpoint="blockchain?.endpoint?.address"
          :hd-path="walletStore?.connectedWallet?.hdPath"
        ></ping-token-convert>
      </Teleport>
    </div>

    <div class="card bg-base-100 shadow-xl rounded-box p-6 mt-6">
      <h2 class="text-2xl font-bold text-base-content mb-4">{{ $t('index.app_versions') }}</h2>
      <ArrayObjectElement
        :value="paramStore.appVersion?.items"
        :thead="false"
        class="bg-base-200 p-4 rounded-lg"
      />
    </div>

    <div v-if="!store.coingeckoId" class="card bg-base-100 shadow-xl rounded-box p-6 mt-6">
      <h2 class="text-2xl font-bold text-base-content mb-4">{{ $t('index.node_info') }}</h2>
      <ArrayObjectElement :value="paramStore.nodeVersion?.items" :thead="false" class="bg-base-200 p-4 rounded-lg" />
    </div>
  </div>
</template>

<route>
  {
    meta: {
      i18n: 'dashboard',
      order: 1,
    }
  }
</route>
