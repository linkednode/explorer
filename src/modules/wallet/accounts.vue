<script lang="ts" setup>
import { CosmosRestClient } from '@/libs/client';
import { useBlockchain, useDashboard, useFormatter } from '@/stores';
import type { Coin, CoinWithPrice, Delegation } from '@/types';
import { fromBech32, toBase64, toBech32, toHex } from '@cosmjs/encoding';
import { Icon } from '@iconify/vue';
import { computed } from 'vue';
import { ref } from 'vue';
import { scanLocalKeys, type AccountEntry, scanCompatibleAccounts, type LocalKey } from './utils';
import AdBanner from '@/components/ad/AdBanner.vue';

const dashboard = useDashboard();
const chainStore = useBlockchain();
const format = useFormatter();
const sourceAddress = ref(''); //
const sourceHdPath = ref("m/44/118/0'/0/0"); //
const selectedSource = ref({} as LocalKey); //
const importStep = ref('step1');

const conf = ref(JSON.parse(localStorage.getItem('imported-addresses') || '{}') as Record<string, AccountEntry[]>);
const balances = ref({} as Record<string, CoinWithPrice[]>);
const delegations = ref({} as Record<string, Delegation[]>);

// initial loading queue
// load balances
Object.values(conf.value).forEach((imported) => {
  let promise = Promise.resolve();
  for (let i = 0; i < imported.length; i++) {
    promise = promise.then(
      () =>
        new Promise((resolve) => {
          // continue only if the page is living
          if (imported[i].endpoint) {
            loadBalances(imported[i].chainName, imported[i].endpoint || '', imported[i].address).finally(() =>
              resolve()
            );
          } else {
            resolve();
          }
        })
    );
  }
});

const accounts = computed(() => {
  let a = [] as {
    key: string;
    subaccounts: {
      account: AccountEntry;
      delegation: CoinWithPrice;
      balances: CoinWithPrice[];
    }[];
  }[];
  Object.values(conf.value).forEach((x) => {
    const composition = x.map((entry) => {
      const d = delegations.value[entry.address];
      let delegation = {} as CoinWithPrice;
      if (d && d.length > 0) {
        d.forEach((b) => {
          delegation.amount = (Number(b.balance.amount) + Number(delegation.amount || 0)).toFixed();
          delegation.denom = b.balance.denom;
        });
        delegation.value = format.tokenValueNumber(delegation);
        delegation.change24h = format.priceChanges(delegation.denom);
      }
      return {
        account: entry,
        delegation,
        balances: balances.value[entry.address]
          ? balances.value[entry.address].map((x) => {
              const value = format.tokenValueNumber(x);
              return {
                amount: x.amount,
                denom: x.denom,
                value,
                change24h: format.priceChanges(x.denom),
              };
            })
          : [],
      };
    });
    if (x.at(0)) a.push({ key: x.at(0)?.address || ' ', subaccounts: composition });
  });
  return a;
});

const addresses = computed(() => {
  return accounts.value.flatMap((x) => x.subaccounts.map((a) => a.account.address));
  // const temp = [] as string[]
  // accounts.value.forEach((x) => x.accounts.forEach(a => {
  //   temp.push(a.account.address)
  // }));
  // return temp
});

const totalValue = computed(() => {
  return accounts.value
    .flatMap((x) => x.subaccounts)
    .reduce((s, e) => {
      s += e.delegation.value || 0;
      e.balances.forEach((b) => {
        s += b.value || 0;
      });
      return s;
    }, 0);
});

const totalChange = computed(() => {
  return accounts.value
    .flatMap((x) => x.subaccounts)
    .reduce((s, e) => {
      s += ((e.delegation.change24h || 0) * (e.delegation.value || 0)) / 100;
      e.balances.forEach((b) => {
        s += ((b.change24h || 0) * (b.value || 0)) / 100;
      });
      return s;
    }, 0);
});

// Adding Model Boxes
const availableAccount = computed(() => {
  if (sourceAddress.value) {
    return scanCompatibleAccounts([{ cosmosAddress: sourceAddress.value, hdPath: sourceHdPath.value }]).filter(
      (x) => !addresses.value.includes(x.address)
    );
  }
  return [];
});

// helper functions
// remove address from the list
function removeAddress(addr: string) {
  const newConf = {} as Record<string, AccountEntry[]>;
  Object.keys(conf.value).forEach((key) => {
    const acc = conf.value[key].filter((x) => x.address !== addr);
    if (acc.length > 0) newConf[key] = acc;
  });
  conf.value = newConf;
  localStorage.setItem('imported-addresses', JSON.stringify(conf.value));
}

// add address to the local list
async function addAddress(acc: AccountEntry) {
  const { data } = fromBech32(acc.address);
  const key = toBase64(data);

  if (conf.value[key]) {
    // existed
    if (conf.value[key].findIndex((x) => x.address === acc.address) > -1) {
      return;
    }
    conf.value[key].push(acc);
  } else {
    conf.value[key] = [acc];
  }

  // also add chain to favorite
  if (!dashboard?.favoriteMap?.[acc.chainName]) {
    dashboard.favoriteMap[acc.chainName] = true;
    window.localStorage.setItem('favoriteMap', JSON.stringify(dashboard.favoriteMap));
  }

  if (acc.endpoint) {
    loadBalances(acc.chainName, acc.endpoint, acc.address);
  }

  localStorage.setItem('imported-addresses', JSON.stringify(conf.value));
}

// load balances for an address
async function loadBalances(chainName: string, endpoint: string, address: string) {
  const endpointObj = chainStore.randomEndpoint(chainName);
  const client = CosmosRestClient.newDefault(endpointObj?.address || endpoint);
  await client.getBankBalances(address).then((res) => {
    balances.value[address] = res.balances.filter((x) => x.denom.length < 10);
  });
  await client.getStakingDelegations(address).then((res) => {
    delegations.value[address] = res.delegation_responses;
  });
}
</script>
<template>
  <div>
    <div class="bg-base-100 shadow-md rounded-box p-4 mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div class="min-w-0 flex-1">
          <h2 class="text-2xl font-bold leading-7 text-base-content sm:truncate sm:text-3xl sm:tracking-tight">
            {{ $t('wallet.accounts_title') }}
          </h2>
          <div class="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div class="mt-2 flex items-center text-sm text-neutral-content">
              <Icon icon="mdi:wallet-outline" class="mr-1.5 h-5 w-5 flex-shrink-0 text-primary" />
              {{ $t('wallet.accounts_description') }}
            </div>
          </div>
        </div>
        <div class="flex flex-col text-right mt-4 lg:mt-0">
          <span class="text-neutral-content">{{ $t('wallet.total_value') }}</span>
          <span class="text-2xl text-success font-bold">${{ format.formatNumber(totalValue, '0,0.[00]') }}</span>
          <span class="text-sm" :class="format.color(totalChange)">{{
            format.formatNumber(totalChange, '+0,0.[00]')
          }}</span>
        </div>
      </div>
    </div>

    <AdBanner id="account-banner-ad" unit="banner" width="970px" height="90px" />

    <div class="space-y-6">
      <div v-for="{ key, subaccounts } in accounts" :key="key" class="bg-base-100 shadow-md rounded-box p-4">
        <div class="flex items-center mb-4">
          <div class="mr-4 p-2 rounded-full bg-primary/10 flex items-center justify-center" :style="{ color: chainStore.current?.themeColor || '#666CFF' }">
            <Icon icon="mdi:wallet-outline" class="text-3xl" />
          </div>
          <div class="flex flex-col">
            <div class="font-bold text-base-content text-lg break-all">{{ key }}</div>
            <div class="dropdown dropdown-hover">
              <label tabindex="0" class="text-sm text-neutral-content cursor-pointer hover:text-primary transition-colors">{{ subaccounts.length }} addresses</label>
              <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-200 rounded-box z-50 w-72">
                <li v-for="x in subaccounts" :key="x.account.address">
                  <a class="flex items-center justify-between">
                    <div class="flex items-center">
                      <img :src="x.account.logo" class="w-6 h-6 mr-2 rounded-full object-contain" />
                      <span class="font-medium capitalize text-base-content">
                        {{ x.account.chainName }}
                        <br />
                        <span class="text-xs font-normal text-neutral-content break-all">{{ x.account.address }}</span>
                      </span>
                    </div>
                    <button class="btn btn-xs btn-error capitalize text-error-content" @click.prevent="removeAddress(x.account.address)">{{ $t('wallet.remove') }}</button>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="divider my-4"></div>

        <div class="mb-4">
          <h3 class="text-base font-semibold text-base-content mb-2">{{ $t('wallet.delegations') }}</h3>
          <ul class="menu p-0 space-y-2">
            <li v-for="x in subaccounts" :key="x.account.address + '-delegation'">
              <RouterLink
                v-if="x.delegation.amount"
                :to="`/${x.account.chainName}/account/${x.account.address}`"
                class="flex items-center justify-between p-3 bg-base-200 rounded-box hover:bg-base-300 transition-colors"
              >
                <div class="flex items-center">
                  <img :src="x.account.logo" class="w-6 h-6 mr-2 rounded-full object-contain" />
                  <span class="font-bold text-base-content">
                    {{ format.formatToken(x.delegation, true, '0,0.[00]', 'all') }}
                    <br />
                    <span class="text-xs" :class="format.color(x.delegation.change24h)">{{ format.formatNumber(x.delegation.change24h, '+0.[00]') }}%</span>
                  </span>
                </div>
                <span class="text-right text-base-content">
                  ${{ format.formatNumber(x.delegation.value, '0,0.[00]') }}
                  <br />
                  <span class="text-xs" :class="format.color(x.delegation.change24h)">{{
                    format.formatNumber(
                      ((x.delegation.change24h || 0) * (x.delegation.value || 0)) / 100,
                      '+0,0.[00]'
                    )
                  }}</span>
                </span>
              </RouterLink>
            </li>
            <li v-if="!subaccounts.some(s => s.delegation.amount)">
              <span class="text-neutral-content text-sm">{{ $t('wallet.no_delegations') }}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-base font-semibold text-base-content mb-2">{{ $t('wallet.balances') }}</h3>
          <ul class="menu p-0 space-y-2">
            <li v-for="s in subaccounts" :key="s.account.address + '-balance'">
              <RouterLink
                v-for="x in s.balances"
                :key="x.denom"
                :to="`/${s.account.chainName}/account/${s.account.address}`"
                class="flex items-center justify-between p-3 bg-base-200 rounded-box hover:bg-base-300 transition-colors"
              >
                <div class="flex items-center">
                  <img :src="s.account.logo" class="w-6 h-6 mr-2 rounded-full object-contain" />
                  <span class="font-bold text-base-content">
                    {{ format.formatToken(x, true, '0,0.[00]', 'all') }}
                    <br />
                    <span class="text-xs" :class="format.color(x.change24h)">{{ format.formatNumber(x.change24h, '+0.[00]') }}%</span>
                  </span>
                </div>
                <span class="text-right text-base-content">
                  ${{ format.formatNumber(x.value, '0,0.[00]') }}
                  <br />
                  <span class="text-xs" :class="format.color(x.change24h)">{{ format.formatNumber(((x.change24h || 0) * (x.value || 0)) / 100, '+0,0.[00]') }}</span>
                </span>
              </RouterLink>
            </li>
            <li v-if="!subaccounts.some(s => s.balances.length > 0)">
              <span class="text-neutral-content text-sm">{{ $t('wallet.no_balances') }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="text-center mt-6">
        <a
          href="#address-modal"
          class="btn btn-primary capitalize text-primary-content"
        >
          <Icon icon="mdi:plus" class="mr-2 text-xl" />
          {{ $t('wallet.import_address') }}
        </a>
      </div>
    </div>
    <div class="modal" id="address-modal">
      <div class="modal-box relative w-11/12 max-w-2xl">
        <a href="#" class="btn btn-sm btn-circle absolute right-4 top-4">✕</a>
        <h3 class="font-bold text-xl text-base-content mb-4">{{ $t('wallet.derive_account_title') }}</h3>
        <div class="space-y-4">
          <label class="form-control w-full">
            <span class="label-text text-base-content mb-1">{{ $t('wallet.input_address') }}</span>
            <input
              v-model="sourceAddress"
              class="input input-bordered w-full bg-base-200 text-base-content"
              :placeholder="$t('wallet.input_address_placeholder')"
              @change="importStep = 'step2'"
            />
          </label>
          <label class="form-control w-full">
            <span class="label-text text-base-content mb-1">{{ $t('wallet.hd_path') }}</span>
            <input v-model="sourceHdPath" class="input input-bordered w-full bg-base-200 text-base-content" placeholder="m/44/118/0'/0/0" />
          </label>
        </div>
        <div
          v-show="importStep === 'step2'"
          class="py-4 max-h-72 overflow-y-auto mt-6 bg-base-200 rounded-box"
        >
          <table class="table w-full table-zebra">
            <thead>
              <tr>
                <th class="text-left uppercase text-base-content font-semibold">{{ $t('wallet.account') }}</th>
                <th class="text-center uppercase text-base-content font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="acc in availableAccount" :key="acc.address" class="hover:bg-base-300 transition-colors duration-200">
                <td>
                  <div class="flex items-center space-x-3">
                    <div class="avatar">
                      <div class="mask mask-squircle w-8 h-8">
                        <img :src="acc.logo" :alt="acc.address" class="object-contain" />
                      </div>
                    </div>
                    <div>
                      <div
                        class="tooltip tooltip-right"
                        :class="acc.compatiable ? 'tooltip-success' : 'tooltip-error'"
                        :data-tip="`Coin Type: ${acc.coinType}`"
                      >
                        <div class="font-bold capitalize" :class="acc.compatiable ? 'text-success' : 'text-error'">
                          {{ acc.chainName }}
                        </div>
                      </div>
                      <div class="text-xs text-neutral-content break-all">
                        {{ acc.address }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="text-right">
                  <button
                    class="btn btn-primary btn-xs capitalize text-primary-content"
                    @click="addAddress(acc)"
                  >
                    <Icon icon="mdi:plus" class="text-lg" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-action mt-6">
          <a
            href="#"
            class="btn btn-ghost capitalize text-neutral-content"
            @click="importStep = 'step1'"
            >Close</a
          >
        </div>
      </div>
    </div>
  </div>
</template>
