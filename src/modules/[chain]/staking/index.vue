<script lang="ts" setup>
import { useBaseStore, useBlockchain, useFormatter, useMintStore, useStakingStore, useTxDialog } from '@/stores';
import { computed } from '@vue/reactivity';
import { onMounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import type { Key, SlashingParam, Validator } from '@/types';
import { formatSeconds } from '@/libs/utils';
import { diff } from 'semver';

const staking = useStakingStore();
const base = useBaseStore();
const format = useFormatter();
const dialog = useTxDialog();
const chainStore = useBlockchain();
const mintStore = useMintStore();

const cache = JSON.parse(localStorage.getItem('avatars') || '{}');
const avatars = ref(cache || {});
const latest = ref({} as Record<string, number>);
const yesterday = ref({} as Record<string, number>);
const tab = ref('active');
const unbondList = ref([] as Validator[]);
const slashing = ref({} as SlashingParam);

onMounted(() => {
  staking.fetchUnbondingValdiators().then((res) => {
    unbondList.value = res.concat(unbondList.value);
  });
  staking.fetchInacitveValdiators().then((res) => {
    unbondList.value = unbondList.value.concat(res);
  });
  chainStore.rpc.getSlashingParams().then((res) => {
    slashing.value = res.params;
  });
});

async function fetchChange(blockWindow: number = 14400) {
  let page = 0;

  let height = Number(base.latest?.block?.header?.height || 0);
  if (height > blockWindow) {
    height -= blockWindow;
  } else {
    height = 1;
  }
  // voting power in 24h ago
  while (page < staking.validators.length && height > 0) {
    await base.fetchValidatorByHeight(height, page).then((x) => {
      x.validators.forEach((v) => {
        yesterday.value[v.pub_key.key] = Number(v.voting_power);
      });
    });
    page += 100;
  }

  page = 0;
  // voting power for now
  while (page < staking.validators.length) {
    await base.fetchLatestValidators(page).then((x) => {
      x.validators.forEach((v) => {
        latest.value[v.pub_key.key] = Number(v.voting_power);
      });
    });
    page += 100;
  }
}

const changes = computed(() => {
  const changes = {} as Record<string, number>;
  Object.keys(latest.value).forEach((k) => {
    const l = latest.value[k] || 0;
    const y = yesterday.value[k] || 0;
    changes[k] = l - y;
  });
  return changes;
});

const change24 = (entry: { consensus_pubkey: Key; tokens: string }) => {
  const txt = entry.consensus_pubkey.key;
  // const n: number = latest.value[txt];
  // const o: number = yesterday.value[txt];
  // // console.log( txt, n, o)
  // return n > 0 && o > 0 ? n - o : 0;

  const latestValue = latest.value[txt];
  if (!latestValue) {
    return 0;
  }

  const displayTokens = format.tokenAmountNumber({
    amount: parseInt(entry.tokens, 10).toString(),
    denom: staking.params.bond_denom,
  });
  const coefficient = displayTokens / latestValue;
  return changes.value[txt] * coefficient;
};

const change24Text = (entry: { consensus_pubkey: Key; tokens: string }) => {
  if (!entry) return '';
  const v = change24(entry);
  return v && v !== 0 ? format.showChanges(v) : '';
};

const change24Color = (entry: { consensus_pubkey: Key; tokens: string }) => {
  if (!entry) return '';
  const v = change24(entry);
  if (v > 0) return 'text-success';
  if (v < 0) return 'text-error';
};

const calculateRank = function (position: number) {
  let sum = 0;
  for (let i = 0; i < position; i++) {
    sum += Number(staking.validators[i]?.delegator_shares);
  }
  const percent = sum / staking.totalPower;

  switch (true) {
    case tab.value === 'active' && percent < 0.33:
      return 'error';
    case tab.value === 'active' && percent < 0.67:
      return 'warning';
    default:
      return 'primary';
  }
};

function isFeatured(endpoints: string[], who?: { website?: string; moniker: string }) {
  if (!endpoints || !who) return false;
  return (
    endpoints.findIndex(
      (x) =>
        (who.website && who.website?.substring(0, who.website?.lastIndexOf('.')).endsWith(x)) ||
        who?.moniker?.toLowerCase().search(x.toLowerCase()) > -1
    ) > -1
  );
}

const list = computed(() => {
  if (tab.value === 'active') {
    return staking.validators.map((x, i) => ({ v: x, rank: calculateRank(i), logo: logo(x.description.identity) }));
  } else if (tab.value === 'featured') {
    const endpoint = chainStore.current?.endpoints?.rest?.map((x) => x.provider);
    if (endpoint) {
      endpoint.push('ping');
      return staking.validators
        .filter((x) => isFeatured(endpoint.filter(Boolean) as string[], x.description))
        .map((x, i) => ({ v: x, rank: 'primary', logo: logo(x.description.identity) }));
    }
    return [];
  }
  return unbondList.value.map((x, i) => ({ v: x, rank: 'primary', logo: logo(x.description.identity) }));
});

const fetchAvatar = (identity: string) => {
  // fetch avatar from keybase
  return new Promise<void>((resolve) => {
    staking
      .keybase(identity)
      .then((d) => {
        if (Array.isArray(d.them) && d.them.length > 0) {
          const uri = String(d.them[0]?.pictures?.primary?.url).replace(
            'https://s3.amazonaws.com/keybase_processed_uploads/',
            ''
          );

          avatars.value[identity] = uri;
          resolve();
        } else throw new Error(`failed to fetch avatar for ${identity}`);
      })
      .catch((error) => {
        // console.error(error); // uncomment this if you want the user to see which avatars failed to load.
        resolve();
      });
  });
};

const loadAvatar = (identity: string) => {
  // fetches avatar from keybase and stores it in localStorage
  fetchAvatar(identity).then(() => {
    localStorage.setItem('avatars', JSON.stringify(avatars.value));
  });
};

const loadAvatars = () => {
  // fetches all avatars from keybase and stores it in localStorage
  const promises = staking.validators.map((validator) => {
    const identity = validator.description?.identity;

    // Here we also check whether we haven't already fetched the avatar
    if (identity && !avatars.value[identity]) {
      return fetchAvatar(identity);
    } else {
      return Promise.resolve();
    }
  });

  Promise.all(promises).then(() => localStorage.setItem('avatars', JSON.stringify(avatars.value)));
};

const logo = (identity?: string) => {
  if (!identity || !avatars.value[identity]) return '';
  const url = avatars.value[identity] || '';
  return url.startsWith('http') ? url : `https://s3.amazonaws.com/keybase_processed_uploads/${url}`;
};

const loaded = ref(false);
base.$subscribe((_, s) => {
  if (s.recents.length >= 2 && loaded.value === false) {
    loaded.value = true;
    const diff_time = Date.parse(s.recents[1].block.header.time) - Date.parse(s.recents[0].block.header.time);
    const diff_height = Number(s.recents[1].block.header.height) - Number(s.recents[0].block.header.height);
    const block_window = Number(Number((86400 * 1000 * diff_height) / diff_time).toFixed(0));
    fetchChange(block_window);
  }
});

loadAvatars();
</script>
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Staking Parameters Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card bg-base-100 shadow-xl rounded-box p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center text-2xl">
          <Icon icon="mdi:trending-up" />
        </div>
        <div>
          <div class="text-2xl font-bold text-base-content">{{ format.percent(mintStore.inflation) }}</div>
          <div class="text-sm text-neutral-content">{{ $t('staking.inflation') }}</div>
        </div>
      </div>
      <div class="card bg-base-100 shadow-xl rounded-box p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl">
          <Icon icon="mdi:lock-open-outline" />
        </div>
        <div>
          <div class="text-2xl font-bold text-base-content">{{ formatSeconds(staking.params?.unbonding_time) }}</div>
          <div class="text-sm text-neutral-content">{{ $t('staking.unbonding_time') }}</div>
        </div>
      </div>
      <div class="card bg-base-100 shadow-xl rounded-box p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-error/20 text-error flex items-center justify-center text-2xl">
          <Icon icon="mdi:alert-octagon-outline" />
        </div>
        <div>
          <div class="text-2xl font-bold text-base-content">{{ format.percent(slashing.slash_fraction_double_sign) }}</div>
          <div class="text-sm text-neutral-content">{{ $t('staking.double_sign_slashing') }}</div>
        </div>
      </div>
      <div class="card bg-base-100 shadow-xl rounded-box p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-error/20 text-error flex items-center justify-center text-2xl">
          <Icon icon="mdi:pause" />
        </div>
        <div>
          <div class="text-2xl font-bold text-base-content">{{ format.percent(slashing.slash_fraction_downtime) }}</div>
          <div class="text-sm text-neutral-content">{{ $t('staking.downtime_slashing') }}</div>
        </div>
      </div>
    </div>

    <!-- Validator List Section -->
    <div class="card bg-base-100 shadow-xl rounded-box p-6">
      <div class="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div class="tabs tabs-boxed bg-base-200 p-1 rounded-lg flex-grow">
          <a class="tab tab-lg flex-1 font-semibold" :class="{ 'tab-active tab-primary': tab === 'featured' }" @click="tab = 'featured'">
            {{ $t('staking.popular') }}
          </a>
          <a class="tab tab-lg flex-1 font-semibold" :class="{ 'tab-active tab-primary': tab === 'active' }" @click="tab = 'active'">
            {{ $t('staking.active') }}
          </a>
          <a class="tab tab-lg flex-1 font-semibold" :class="{ 'tab-active tab-primary': tab === 'inactive' }" @click="tab = 'inactive'">
            {{ $t('staking.inactive') }}
          </a>
        </div>
        <div class="text-lg font-semibold text-base-content">
          {{ list.length }} / {{ staking.params.max_validators }} {{ $t('staking.validators') }}
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th class="w-16">#</th>
              <th>{{ $t('staking.validator') }}</th>
              <th class="text-right">{{ $t('staking.voting_power') }}</th>
              <th class="text-right">{{ $t('staking.24h_changes') }}</th>
              <th class="text-right">{{ $t('staking.commission') }}</th>
              <th class="text-center">{{ $t('staking.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="({ v, rank, logo }, i) in list" :key="v.operator_address" class="hover:bg-base-200">
              <td>
                <div class="badge badge-outline" :class="{ 'badge-error': rank === 'error', 'badge-warning': rank === 'warning', 'badge-primary': rank === 'primary' }">
                  {{ i + 1 }}
                </div>
              </td>
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar">
                    <div class="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center">
                      <img
                        v-if="logo"
                        :src="logo"
                        class="object-cover w-full h-full rounded-full"
                        @error="
                          (e) => {
                            const identity = v.description?.identity;
                            if (identity) loadAvatar(identity);
                          }
                        "
                      />
                      <Icon v-else icon="mdi:help-circle-outline" class="text-2xl text-neutral-content" />
                    </div>
                  </div>
                  <div>
                    <RouterLink
                      :to="{
                        name: 'chain-staking-validator',
                        params: {
                          validator: v.operator_address,
                        },
                      }"
                      class="link link-hover font-semibold text-base-content"
                    >
                      {{ v.description?.moniker }}
                    </RouterLink>
                    <div class="text-xs text-neutral-content">{{ v.description?.website || v.description?.identity || '-' }}</div>
                  </div>
                </div>
              </td>
              <td class="text-right">
                <div class="font-semibold text-base-content">
                  {{
                    format.formatToken(
                      {
                        amount: parseInt(v.tokens).toString(),
                        denom: staking.params.bond_denom,
                      },
                      true,
                      '0,0'
                    )
                  }}
                </div>
                <div class="text-xs text-neutral-content">{{ format.calculatePercent(v.delegator_shares, staking.totalPower) }}</div>
              </td>
              <td class="text-right text-sm font-medium" :class="change24Color(v)">
                {{ change24Text(v) }}
              </td>
              <td class="text-right text-sm text-base-content">
                {{ format.formatCommissionRate(v.commission?.commission_rates?.rate) }}
              </td>
              <td class="text-center">
                <div v-if="v.jailed" class="badge badge-error text-white">
                  {{ $t('staking.jailed') }}
                </div>
                <label
                  v-else
                  for="delegate"
                  class="btn btn-sm btn-primary"
                  @click="
                    dialog.open('delegate', {
                      validator_address: v.operator_address,
                    })
                  "
                >
                  {{ $t('account.btn_delegate') }}
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-4 mt-6 p-4 bg-base-200 rounded-lg">
        <div class="badge badge-error badge-outline p-3 text-xs">
          {{ $t('staking.top') }} 33%
        </div>
        <div class="badge badge-warning badge-outline p-3 text-xs">
          {{ $t('staking.top') }} 67%
        </div>
        <p class="text-sm text-neutral-content text-center md:text-left flex-1">
          {{ $t('staking.description') }}
        </p>
      </div>
    </div>
  </div>
</template>
