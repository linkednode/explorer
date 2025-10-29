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
  <div>
    <div v-if="coinInfo && coinInfo.name" class="bg-base-100 shadow-md rounded-box">
      <div class="grid grid-cols-2 md:grid-cols-3 p-4">
        <div class="col-span-2 md:col-span-1">
          <div class="text-xl font-bold text-base-content">
            {{ coinInfo.name }} (<span class="uppercase">{{ coinInfo.symbol }}</span
            >)
          </div>
          <div class="text-xs mt-2 text-neutral-content">
            {{ $t('index.rank') }}:
            <div
              class="badge badge-error text-error-content text-xs"
            >
              #{{ coinInfo.market_cap_rank }}
            </div>
          </div>

          <div class="my-4 flex flex-wrap items-center">
            <a
              v-for="(item, index) of comLinks"
              :key="index"
              :href="item.href"
              class="link link-hover text-primary px-2 py-1 rounded-btn flex items-center transition-colors duration-200"
            >
              <Icon :icon="item?.icon" />
              <span class="ml-1 text-sm uppercase text-base-content">{{ item?.name }}</span>
            </a>
          </div>

          <div>
            <div class="dropdown dropdown-hover w-full">
              <label>
                <div
                  class="bg-base-200 flex items-center justify-between px-4 py-2 cursor-pointer rounded-box"
                >
                  <div>
                    <div
                      class="font-semibold text-xl text-base-content"
                    >
                      {{ ticker?.market?.name || '' }}
                    </div>
                    <div class="text-neutral-content text-sm">
                      {{ shortName(ticker?.base, ticker?.coin_id) }}/{{
                        shortName(ticker?.target, ticker?.target_coin_id)
                      }}
                    </div>
                  </div>

                  <div class="text-right">
                    <div
                      class="text-xl font-bold text-base-content"
                    >
                      ${{ ticker?.converted_last?.usd }}
                    </div>
                    <div class="text-sm" :class="store.priceColor">{{ store.priceChange }}%</div>
                  </div>
                </div>
              </label>
              <div class="dropdown-content pt-1">
                <div class="h-64 overflow-auto w-full shadow-lg rounded-box">
                  <ul class="menu w-full bg-base-100 rounded-box">
                    <li
                      v-for="(item, index) in store.coinInfo.tickers"
                      :key="index"
                      @click="store.selectTicker(index)"
                    >
                      <div
                        class="flex items-center justify-between hover:bg-base-200"
                      >
                        <div class="flex-1">
                          <div
                            class="text-base-content text-sm"
                            :class="trustColor(item.trust_score)"
                          >
                            {{ item?.market?.name }}
                          </div>
                          <div class="text-sm text-neutral-content">
                            {{ shortName(item?.base, item?.coin_id) }}/{{
                              shortName(item?.target, item?.target_coin_id)
                            }}
                          </div>
                        </div>

                        <div class="text-base text-base-content">${{ item?.converted_last?.usd }}</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="flex">
              <label class="btn btn-primary !px-1 my-5 mr-2 text-primary-content" for="calculator">
                <svg
                  class="w-8 h-8"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                    <line x1="8" x2="16" y1="6" y2="6"></line>
                    <line x1="16" x2="16" y1="14" y2="18"></line>
                    <path d="M16 10h.01"></path>
                    <path d="M12 10h.01"></path>
                    <path d="M8 10h.01"></path>
                    <path d="M12 14h.01"></path>
                    <path d="M8 14h.01"></path>
                    <path d="M12 18h.01"></path>
                    <path d="M8 18h.01"></path>
                  </g>
                </svg>
              </label>
              <!-- Put this part before </body> tag -->
              <input type="checkbox" id="calculator" class="modal-toggle" />
              <div class="modal">
                <div class="modal-box bg-base-100 rounded-box">
                  <h3 class="text-xl font-bold text-base-content">
                    {{ $t('index.price_calculator') }}
                  </h3>
                  <div class="flex flex-col w-full mt-5">
                    <div
                      class="grid h-20 flex-grow card rounded-box place-items-center"
                    >
                      <div class="join w-full">
                        <label class="join-item btn btn-ghost text-base-content">
                          <span class="uppercase">{{ coinInfo.symbol }}</span>
                        </label>
                        <input
                          type="number"
                          v-model="qty"
                          min="0"
                          placeholder="Input a number"
                          class="input grow input-bordered join-item"
                        />
                      </div>
                    </div>
                    <div class="divider">=</div>
                    <div
                      class="grid h-20 flex-grow card rounded-box place-items-center"
                    >
                      <div class="join w-full">
                        <label class="join-item btn btn-ghost text-base-content">
                          <span>USD</span>
                        </label>
                        <input
                          type="number"
                          v-model="amount"
                          min="0"
                          placeholder="Input amount"
                          class="join-item grow input input-bordered"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <label class="modal-backdrop text-base-content" for="calculator">{{
                  $t('index.close')
                }}</label>
              </div>
              <a
                class="my-5 btn grow text-primary-content"
                :class="{ 'btn-success': store.trustColor === 'green', 'btn-warning': store.trustColor === 'yellow' }"
                :href="tickerUrl(ticker.trade_url)"
                target="_blank"
              >
                {{ $t('index.buy') }} {{ coinInfo.symbol || '' }}
              </a>
            </div>
          </div>
        </div>

        <div class="col-span-2">
          <PriceMarketChart />
        </div>
      </div>
      <div class="h-[1px] w-full bg-base-300"></div>
      <div class="max-h-[250px] overflow-auto p-4 text-sm text-base-content">
        <MdEditor
          :model-value="coinInfo.description?.en"
          previewOnly
        ></MdEditor>
      </div>
      <div class="mx-4 flex flex-wrap items-center">
        <div
          v-for="tag in coinInfo.categories"
          class="mr-2 mb-4 text-xs badge badge-outline badge-neutral"
        >
          {{ tag }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 md:!grid-cols-3 lg:!grid-cols-6 mt-4">
      <div v-for="(item, key) in store.stats" :key="key">
        <CardStatisticsVertical v-bind="item" />
      </div>
    </div>

    <div
      v-if="blockchain.supportModule('governance')"
      class="bg-base-100 shadow-md rounded-box mt-4"
    >
      <div class="px-4 pt-4 pb-2 text-xl font-semibold text-base-content">
        {{ $t('index.active_proposals') }}
      </div>
      <div class="px-4 pb-4">
        <ProposalListItem :proposals="store?.proposals" />
      </div>
      <div
        class="pb-8 text-center text-neutral-content"
        v-if="store.proposals?.proposals?.length === 0"
      >
        {{ $t('index.no_active_proposals') }}
      </div>
    </div>

    <div class="bg-base-100 shadow-md rounded-box mt-4">
      <div class="flex justify-between px-4 pt-4 pb-2 text-xl font-semibold text-base-content">
        <span class="truncate">{{ walletStore.currentAddress || 'Not Connected' }}</span>
        <RouterLink
          v-if="walletStore.currentAddress"
          class="float-right text-sm cursor-pointert link link-hover text-primary font-medium"
          :to="`/${chain}/account/${walletStore.currentAddress}`"
          >{{ $t('index.more') }}</RouterLink
        >
      </div>
      <div
        class="grid grid-cols-1 md:!grid-cols-4 auto-cols-auto gap-4 px-4 pb-6"
      >
        <div class="bg-base-200 rounded-md px-4 py-3">
          <div class="text-sm mb-1 text-neutral-content">{{ $t('account.balance') }}</div>
          <div class="text-lg font-bold text-base-content">
            {{ format.formatToken(walletStore.balanceOfStakingToken) }}
          </div>
          <div class="text-sm" :class="color">${{ format.tokenValue(walletStore.balanceOfStakingToken) }}</div>
        </div>
        <div class="bg-base-200 rounded-md px-4 py-3">
          <div class="text-sm mb-1 text-neutral-content">{{ $t('module.staking') }}</div>
          <div class="text-lg font-bold text-base-content">
            {{ format.formatToken(walletStore.stakingAmount) }}
          </div>
          <div class="text-sm" :class="color">${{ format.tokenValue(walletStore.stakingAmount) }}</div>
        </div>
        <div class="bg-base-200 rounded-md px-4 py-3">
          <div class="text-sm mb-1 text-neutral-content">{{ $t('index.reward') }}</div>
          <div class="text-lg font-bold text-base-content">
            {{ format.formatToken(walletStore.rewardAmount) }}
          </div>
          <div class="text-sm" :class="color">${{ format.tokenValue(walletStore.rewardAmount) }}</div>
        </div>
        <div class="bg-base-200 rounded-md px-4 py-3">
          <div class="text-sm mb-1 text-neutral-content">{{ $t('index.unbonding') }}</div>
          <div class="text-lg font-bold text-base-content">
            {{ format.formatToken(walletStore.unbondingAmount) }}
          </div>
          <div class="text-sm" :class="color">${{ format.tokenValue(walletStore.unbondingAmount) }}</div>
        </div>
      </div>

      <div
        v-if="walletStore.delegations.length > 0"
        class="px-4 pb-4 overflow-x-auto"
      >
        <table class="table table-compact w-full table-zebra">
          <thead>
            <tr>
              <th>{{ $t('account.validator') }}</th>
              <th>{{ $t('account.delegations') }}</th>
              <th>{{ $t('account.rewards') }}</th>
              <th>{{ $t('staking.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in walletStore.delegations" :key="index">
              <td>
                <RouterLink
                  class="link link-hover text-primary"
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
                      (el: { validator_address: string; reward: any[] }) => el?.validator_address === item?.delegation?.validator_address
                    )?.reward
                  )
                }}
              </td>
              <td>
                <div>
                  <label
                    for="delegate"
                    class="btn btn-xs btn-primary btn-outline rounded-btn mr-2"
                    @click="
                      dialog.open('delegate', { validator_address: item.delegation.validator_address }, updateState)
                    "
                  >
                    {{ $t('account.btn_delegate') }}
                  </label>
                  <label
                    for="withdraw"
                    class="btn btn-xs btn-primary btn-outline rounded-btn"
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

      <div class="grid grid-cols-3 gap-4 px-4 pb-6 mt-4">
        <label for="PingTokenConvert" class="btn btn-primary text-primary-content">{{ $t('index.btn_swap') }}</label>
        <label for="send" class="btn btn-success text-success-content" @click="dialog.open('send', {}, updateState)">{{
          $t('account.btn_send')
        }}</label>
        <label
          for="delegate"
          class="btn btn-info text-info-content"
          @click="dialog.open('delegate', {}, updateState)"
          >{{ $t('account.btn_delegate') }}</label
        >
        <RouterLink to="/wallet/receive" class="btn btn-info text-info-content hidden">{{
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

    <div class="bg-base-100 shadow-md rounded-box mt-4">
      <div class="px-4 pt-4 pb-2 text-xl font-semibold text-base-content">
        {{ $t('index.app_versions') }}
      </div>
      <!-- Application Version -->
      <ArrayObjectElement
        :value="paramStore.appVersion?.items"
        :thead="false"
      />
      <div class="h-4"></div>
    </div>

    <div v-if="!store.coingeckoId" class="bg-base-100 shadow-md rounded-box mt-4">
      <div class="px-4 pt-4 pb-2 text-xl font-semibold text-base-content">
        {{ $t('index.node_info') }}
      </div>
      <ArrayObjectElement :value="paramStore.nodeVersion?.items" :thead="false" />
      <div class="h-4"></div>
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
