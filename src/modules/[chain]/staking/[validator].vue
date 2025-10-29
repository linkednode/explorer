<script setup lang="ts">
import { parseCoins } from '@cosmjs/stargate';
import {
  useBankStore,
  useBlockchain,
  useDistributionStore,
  useFormatter,
  useMintStore,
  useStakingStore,
  useTxDialog,
} from '@/stores';
import { onMounted, computed, ref } from 'vue';
import { Icon } from '@iconify/vue';
import CommissionRate from '@/components/ValidatorCommissionRate.vue';
import { consensusPubkeyToHexAddress, operatorAddressToAccount, pubKeyToValcons } from '@/libs';
import {
  PageRequest,
  type Coin,
  type Delegation,
  type PaginatedDelegations,
  type PaginatedTxs,
  type Validator,
} from '@/types';
import PaginationBar from '@/components/PaginationBar.vue';
import { fromBase64, toBase64 } from '@cosmjs/encoding';
import { stringToUint8Array, uint8ArrayToString } from '@/libs/utils';

const props = defineProps(['validator', 'chain']);

const staking = useStakingStore();
const blockchain = useBlockchain();
const format = useFormatter();
const dialog = useTxDialog();
const page = new PageRequest();

const validator: string = props.validator;

const v = ref({} as Validator);
const cache = JSON.parse(localStorage.getItem('avatars') || '{}');
const avatars = ref(cache || {});
const identity = ref('');
const rewards = ref([] as Coin[] | undefined);
const commission = ref([] as Coin[] | undefined);
const delegations = ref({} as PaginatedDelegations);
const addresses = ref(
  {} as {
    account: string;
    operAddress: string;
    hex: string;
    valCons: string;
  }
);
const selfBonded = ref({} as Delegation);

addresses.value.account = operatorAddressToAccount(validator);
// load self bond
staking.fetchValidatorDelegation(validator, addresses.value.account).then((x) => {
  if (x) {
    selfBonded.value = x.delegation_response;
  }
});

const txs = ref({} as PaginatedTxs);

blockchain.rpc.getTxsBySender(addresses.value.account).then((x) => {
  txs.value = x;
});

const apr = computed(() => {
  const rate = Number(v.value.commission?.commission_rates.rate || 0);
  const inflation = useMintStore().inflation;
  const communityTax = Number(useDistributionStore().params.community_tax);
  const bondedRatio =
    Number(staking.pool.bonded_tokens) / Number(useBankStore().supply.amount);

  return format.percent(((1 - communityTax) * (1 - rate) * Number(inflation)) / bondedRatio);
});

const selfRate = computed(() => {
  if (selfBonded.value.balance?.amount) {
    return format.calculatePercent(selfBonded.value.balance.amount, v.value.tokens);
  }
  return '-';
});

const logo = (identity?: string) => {
  if (!identity) return '';
  const url = avatars.value[identity] || '';
  return url.startsWith('http') ? url : `https://s3.amazonaws.com/keybase_processed_uploads/${url}`;
};

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
        } else throw new Error(`failed to fetch avatar for ${identity}.`);
      })
      .catch((error) => {
        // console.error(error); // uncomment this if you want the user to see if the avatar failed to load.
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

onMounted(() => {
  if (validator) {
    staking.fetchValidator(validator).then((res) => {
      v.value = res.validator;
      identity.value = res.validator?.description?.identity || '';
      if (identity.value && !avatars.value[identity.value])
        loadAvatar(identity.value);

      addresses.value.hex = consensusPubkeyToHexAddress(v.value.consensus_pubkey);
      addresses.value.valCons = pubKeyToValcons(
        v.value.consensus_pubkey,
        blockchain.current?.bech32ConsensusPrefix || ''
      );
    });
    blockchain.rpc.getDistributionValidatorOutstandingRewards(validator).then((res) => {
      rewards.value = res.rewards?.rewards?.sort((a, b) => Number(b.amount) - Number(a.amount));
      res.rewards?.rewards?.forEach((x) => {
        if (x.denom.startsWith('ibc/')) {
          format.fetchDenomTrace(x.denom);
        }
      });
    });
    blockchain.rpc.getDistributionValidatorCommission(validator).then((res) => {
      commission.value = res.commission?.commission?.sort((a, b) => Number(b.amount) - Number(a.amount));
      res.commission?.commission?.forEach((x) => {
        if (x.denom.startsWith('ibc/')) {
          format.fetchDenomTrace(x.denom);
        }
      });
    });

    // Disable delegations due to its bad performance
    // Comment out the following code if you want to enable it
    // pageload(1)
  }
});
let showCopyToast = ref(0);
const copyWebsite = async (url: string) => {
  if (!url) {
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    showCopyToast.value = 1;
    setTimeout(() => {
      showCopyToast.value = 0;
    }, 1000);
  } catch (err) {
    showCopyToast.value = 2;
    setTimeout(() => {
      showCopyToast.value = 0;
    }, 1000);
  }
};
const tipMsg = computed(() => {
  return showCopyToast.value === 2
    ? { class: 'error', msg: 'Copy Error!' }
    : { class: 'success', msg: 'Copy Success!' };
});

function pageload(p: number) {
  page.setPage(p);
  page.limit = 10;

  blockchain.rpc.getStakingValidatorsDelegations(validator, page).then((res) => {
    delegations.value = res;
  });
}

const events = ref({} as PaginatedTxs);

enum EventType {
  Delegate = 'delegate',
  Unbond = 'unbond',
}

const selectedEventType = ref(EventType.Delegate);

function loadPowerEvents(p: number, type: EventType) {
  selectedEventType.value = type;
  page.setPage(p);
  page.setPageSize(5);
  blockchain.rpc
    .getTxs("?order_by=2&events={type}.validator='{validator}'", { type: selectedEventType.value, validator }, page)
    .then((res) => {
      events.value = res;
    });
}

function pagePowerEvents(page: number) {
  loadPowerEvents(page, selectedEventType.value);
}

pagePowerEvents(1);

function mapEvents(events: { type: string; attributes: { key: string; value: string }[] }[]) {
  const attributes = events
    .filter((x) => x.type === selectedEventType.value)
    .filter(
      (x) =>
        x.attributes.findIndex(
          (attr) => attr.value === validator || attr.value === toBase64(stringToUint8Array(validator))
        ) > -1
    )
    .map((x) => {
      // check if attributes need to decode
      const output = {} as { [key: string]: string };

      if (x.attributes.findIndex((a) => a.key === `amount`) > -1) {
        x.attributes.forEach((attr) => {
          output[attr.key] = attr.value;
        });
      } else {
        x.attributes.forEach((attr) => {
          output[uint8ArrayToString(fromBase64(attr.key))] = uint8ArrayToString(fromBase64(attr.value));
        });
      }

      return output;
    });

  const coinsAsString = attributes.map((x: any) => x.amount).join(',');
  const coins = parseCoins(coinsAsString);

  return coins.map((coin) => format.formatToken(coin)).join(', ');
}

function mapDelegators(messages: any[]) {
  if (!messages) return [];
  return Array.from(new Set(messages.map((x) => x.delegator_address || x.grantee)));
}
</script>
<template>
  <div>
    <div class="bg-base-100 px-4 pt-3 pb-4 rounded-box shadow-md">
      <div class="flex flex-col lg:flex-row py-4">
        <div class="flex-1">
          <div class="flex items-center">
            <div class="avatar mr-4 relative w-24 h-24 rounded-lg overflow-hidden">
              <div class="w-24 h-24 rounded-lg absolute opacity-10 bg-base-200"></div>
              <div class="w-24 h-24 rounded-lg flex items-center justify-center">
                <img
                  v-if="identity && avatars[identity] !== 'undefined'"
                  v-lazy="logo(identity)"
                  class="object-contain"
                  @error="
                    (e) => {
                      loadAvatar(identity);
                    }
                  "
                />
                <Icon v-else class="text-8xl text-neutral-content" :icon="`mdi-help-circle-outline`" />
              </div>
            </div>
            <div class="flex flex-col">
              <h4 class="text-2xl font-bold text-base-content">{{ v.description?.moniker }}</h4>
              <div class="text-sm text-neutral-content mb-4">
                {{ v.description?.identity || '-' }}
              </div>
              <label
                for="delegate"
                class="btn btn-primary btn-sm w-full max-w-[150px] capitalize text-primary-content"
                @click="
                  dialog.open('delegate', {
                    validator_address: v.operator_address,
                  })
                "
                >{{ $t('account.btn_delegate') }}</label
              >
            </div>
          </div>
          <div class="mt-6 text-sm">
            <p class="text-base mb-3 font-semibold text-base-content">{{ $t('staking.about_us') }}</p>
            <div class="space-y-2">
              <div class="flex items-center">
                <Icon icon="mdi-web" class="text-xl mr-2 text-primary" />
                <span class="font-medium text-base-content mr-2"
                  >{{ $t('staking.website') }}:
                </span>
                <a
                  :href="v?.description?.website || '#'"
                  :class="v?.description?.website ? 'link link-hover text-primary' : 'text-neutral-content cursor-default'"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ v.description?.website || '-' }}
                </a>
              </div>
              <div class="flex items-center">
                <Icon icon="mdi-email-outline" class="text-xl mr-2 text-primary" />
                <span class="font-medium text-base-content mr-2"
                  >{{ $t('staking.contact') }}:
                </span>
                <a
                  v-if="v.description?.security_contact"
                  :href="'mailto:' + v.description.security_contact || '#'"
                  class="link link-hover text-primary"
                >
                  {{ v.description?.security_contact || '-' }}
                </a>
                <span v-else class="text-neutral-content">-</span>
              </div>
            </div>
            <p class="text-base mt-6 mb-3 font-semibold text-base-content">
              {{ $t('staking.validator_status') }}
            </p>
            <div class="space-y-2">
              <div class="flex items-center">
                <Icon icon="mdi-shield-account-outline" class="text-xl mr-2 text-primary" />
                <span class="font-medium text-base-content mr-2">{{ $t('staking.status') }}: </span
                ><span class="text-neutral-content">
                  {{ String(v.status).replace('BOND_STATUS_', '') }}
                </span>
              </div>
              <div class="flex items-center">
                <Icon icon="mdi-shield-alert-outline" class="text-xl mr-2 text-primary" />
                <span class="font-medium text-base-content mr-2">{{ $t('staking.jailed') }}: </span>
                <span class="text-neutral-content"> {{ v.jailed || '-' }} </span>
              </div>
            </div>
            <p class="text-base mt-6 mb-3 font-semibold text-base-content">
              {{ $t('staking.liquid_staking') }}
            </p>
            <div class="space-y-2">
              <div class="flex items-center">
                <Icon icon="mdi-lock" class="text-xl mr-2 text-primary" />
                <span class="font-medium text-base-content mr-2">{{ $t('staking.validator_bond_share') }}: </span>
                <span class="text-neutral-content">
                  {{ format.formatToken({ amount: v.validator_bond_shares, denom: staking.params.bond_denom }, false) }}
                </span>
              </div>
              <div class="flex items-center">
                <Icon icon="mdi-waves-arrow-right" class="text-xl mr-2 text-primary" />
                <span class="font-medium text-base-content mr-2"
                  >{{ $t('staking.liquid_staking_shares') }}:
                </span>
                <span class="text-neutral-content">
                  {{ format.formatToken({ amount: v.liquid_shares, denom: staking.params.bond_denom }, false) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex-1 lg:pl-8 mt-8 lg:mt-0">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex items-center p-4 bg-base-200 rounded-box shadow-sm">
              <div class="flex items-center justify-center rounded-full w-10 h-10 bg-primary/20 text-primary mr-3">
                <Icon icon="mdi-coin" class="text-2xl" />
              </div>
              <div class="flex flex-col">
                <h4 class="text-lg font-bold text-base-content">
                  {{
                    format.formatToken2({
                      amount: v.tokens,
                      denom: staking.params.bond_denom,
                    })
                  }}
                </h4>
                <span class="text-sm text-neutral-content">{{ $t('staking.total_bonded') }}</span>
              </div>
            </div>
            <div class="flex items-center p-4 bg-base-200 rounded-box shadow-sm">
              <div class="flex items-center justify-center rounded-full w-10 h-10 bg-secondary/20 text-secondary mr-3">
                <Icon icon="mdi-percent" class="text-2xl" />
              </div>
              <div class="flex flex-col">
                <h4 class="text-lg font-bold text-base-content">{{ format.formatToken(selfBonded.balance) }} ({{ selfRate }})</h4>
                <span class="text-sm text-neutral-content">{{ $t('staking.self_bonded') }}</span>
              </div>
            </div>

            <div class="flex items-center p-4 bg-base-200 rounded-box shadow-sm">
              <div class="flex items-center justify-center rounded-full w-10 h-10 bg-accent/20 text-accent mr-3">
                <Icon icon="mdi-account-tie" class="text-2xl" />
              </div>
              <div class="flex flex-col">
                <h4 class="text-lg font-bold text-base-content">{{ v.min_self_delegation }} {{ staking.params.bond_denom }}</h4>
                <span class="text-sm text-neutral-content">{{ $t('staking.min_self') }}</span>
              </div>
            </div>
            <div class="flex items-center p-4 bg-base-200 rounded-box shadow-sm">
              <div class="flex items-center justify-center rounded-full w-10 h-10 bg-info/20 text-info mr-3">
                <Icon icon="mdi-finance" class="text-2xl" />
              </div>
              <div class="flex flex-col">
                <h4 class="text-lg font-bold text-base-content">{{ apr }}</h4>
                <span class="text-sm text-neutral-content">{{ $t('staking.annual_profit') }}</span>
              </div>
            </div>

            <div class="flex items-center p-4 bg-base-200 rounded-box shadow-sm">
              <div class="flex items-center justify-center rounded-full w-10 h-10 bg-warning/20 text-warning mr-3">
                <Icon icon="mdi:arrow-down-bold-circle-outline" class="text-2xl" />
              </div>
              <div class="flex flex-col">
                <h4 class="text-lg font-bold text-base-content">{{ v.unbonding_height }}</h4>
                <span class="text-sm text-neutral-content">{{
                  $t('staking.unbonding_height')
                }}</span>
              </div>
            </div>

            <div class="flex items-center p-4 bg-base-200 rounded-box shadow-sm">
              <div class="flex items-center justify-center rounded-full w-10 h-10 bg-error/20 text-error mr-3">
                <Icon icon="mdi-clock" class="text-2xl" />
              </div>
              <div class="flex flex-col">
                <h4 v-if="v.unbonding_time && !v.unbonding_time.startsWith('1970')" class="text-lg font-bold text-base-content">
                  {{ format.toDay(v.unbonding_time, 'from') }}
                </h4>
                <h4 v-else class="text-lg font-bold text-base-content">-</h4>
                <span class="text-sm text-neutral-content">{{ $t('staking.unbonding_time') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="text-sm px-4 pt-3 border-t border-base-200 mt-6 text-neutral-content">{{ v.description?.details }}</div>
    </div>

    <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <CommissionRate :commission="v.commission"></CommissionRate>
      <div class="bg-base-100 rounded-box shadow-md relative">
        <div class="card-body p-4">
          <h2 class="card-title text-lg font-semibold text-base-content mb-4">
            {{ $t('staking.commissions_&_rewards') }}
          </h2>
          <div class="flex flex-col justify-between h-full">
            <div class="flex-1 overflow-y-auto max-h-60">
              <p class="text-sm font-medium text-neutral-content mb-2">{{ $t('staking.commissions') }}</p>
              <div class="flex flex-wrap gap-1 mb-4">
                <div
                  v-for="(i, k) in commission"
                  :key="`commission-${k}`"
                  class="badge badge-outline badge-info text-xs"
                >
                  {{ format.formatToken2(i) }}
                </div>
              </div>
              <p class="text-sm font-medium text-neutral-content mb-2">{{ $t('staking.outstanding') }} {{ $t('account.rewards') }}</p>
              <div class="flex flex-wrap gap-1">
                <div v-for="(i, k) in rewards" :key="`reward-${k}`" class="badge badge-outline badge-info text-xs">
                  {{ format.formatToken2(i) }}
                </div>
              </div>
            </div>
            <div class="card-actions justify-end mt-4">
              <label
                for="withdraw_commission"
                class="btn btn-primary w-full capitalize text-primary-content"
                @click="
                  dialog.open('withdraw_commission', {
                    validator_address: v.operator_address,
                  })
                "
                >{{ $t('account.btn_withdraw') }}</label
              >
            </div>
          </div>
        </div>
      </div>
      <div class="bg-base-100 rounded-box shadow-md">
        <div class="card-body p-4">
          <h2 class="card-title text-lg font-semibold text-base-content mb-4">
            {{ $t('staking.addresses') }}
          </h2>
          <div class="space-y-4">
            <div>
              <div class="text-sm font-medium text-neutral-content flex items-center">
                {{ $t('staking.account_addr') }}
                <Icon
                  icon="mdi:content-copy"
                  class="ml-2 cursor-pointer text-base-content hover:text-primary transition-colors"
                  v-show="addresses.account"
                  @click="copyWebsite(addresses.account || '')"
                />
              </div>
              <RouterLink class="text-xs text-primary link link-hover break-all" :to="`/${chain}/account/${addresses.account}`">
                {{ addresses.account }}
              </RouterLink>
            </div>
            <div>
              <div class="text-sm font-medium text-neutral-content flex items-center">
                {{ $t('staking.operator_addr') }}
                <Icon
                  icon="mdi:content-copy"
                  class="ml-2 cursor-pointer text-base-content hover:text-primary transition-colors"
                  v-show="v.operator_address"
                  @click="copyWebsite(v.operator_address || '')"
                />
              </div>
              <div class="text-xs text-neutral-content break-all">
                {{ v.operator_address }}
              </div>
            </div>
            <div>
              <div class="text-sm font-medium text-neutral-content flex items-center">
                {{ $t('staking.hex_addr') }}
                <Icon
                  icon="mdi:content-copy"
                  class="ml-2 cursor-pointer text-base-content hover:text-primary transition-colors"
                  v-show="addresses.hex"
                  @click="copyWebsite(addresses.hex || '')"
                />
              </div>
              <div class="text-xs text-neutral-content break-all">{{ addresses.hex }}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-neutral-content flex items-center">
                {{ $t('staking.signer_addr') }}
                <Icon
                  icon="mdi:content-copy"
                  class="ml-2 cursor-pointer text-base-content hover:text-primary transition-colors"
                  v-show="addresses.valCons"
                  @click="copyWebsite(addresses.valCons || '')"
                />
              </div>
              <div class="text-xs text-neutral-content break-all">{{ addresses.valCons }}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-neutral-content flex items-center">
                {{ $t('staking.consensus_pub_key') }}
                <Icon
                  icon="mdi:content-copy"
                  class="ml-2 cursor-pointer text-base-content hover:text-primary transition-colors"
                  v-show="v.consensus_pubkey"
                  @click="copyWebsite(JSON.stringify(v.consensus_pubkey) || '')"
                />
              </div>
              <div class="text-xs text-neutral-content break-all">{{ v.consensus_pubkey }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="delegations.delegation_responses" class="mt-6 bg-base-100 shadow-md rounded-box p-4">
      <div class="card-body p-0">
        <h2 class="card-title text-lg font-semibold text-base-content mb-4">
          {{ $t('account.delegations') }}
          <span class="badge badge-ghost text-neutral-content ml-2">
            {{ delegations.delegation_responses?.length || 0 }} / {{ delegations.pagination?.total || 0 }}
          </span>
        </h2>
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th class="text-left text-base-content font-semibold">{{ $t('account.delegator') }}</th>
                <th class="text-left text-base-content font-semibold">{{ $t('account.delegation') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="{ balance, delegation } in delegations.delegation_responses" :key="delegation.delegator_address">
                <td class="text-sm text-primary link link-hover">
                  <RouterLink :to="`/${chain}/account/${delegation.delegator_address}`">
                    {{ delegation.delegator_address }}
                  </RouterLink>
                </td>
                <td class="truncate text-neutral-content">
                  {{ format.formatToken(balance) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <PaginationBar :total="delegations.pagination?.total" :limit="page.limit" :callback="pageload" class="mt-4" />
      </div>
    </div>

    <div class="mt-6 bg-base-100 shadow-md rounded-box p-4">
      <div class="card-body p-0">
        <h2 class="card-title text-lg font-semibold text-base-content mb-4">
          {{ $t('account.transactions') }}
        </h2>
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th class="text-left text-base-content font-semibold">{{ $t('account.height') }}</th>
                <th class="text-left text-base-content font-semibold">{{ $t('account.hash') }}</th>
                <th class="text-left text-base-content font-semibold">{{ $t('account.messages') }}</th>
                <th class="text-left text-base-content font-semibold">{{ $t('account.time') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in txs.tx_responses" :key="item.txhash">
                <td class="text-sm text-primary link link-hover">
                  <RouterLink :to="`/${props.chain}/block/${item.height}`">{{ item.height }}</RouterLink>
                </td>
                <td class="truncate text-primary link link-hover" style="max-width: 200px">
                  <RouterLink :to="`/${props.chain}/tx/${item.txhash}`">
                    {{ item.txhash }}
                  </RouterLink>
                </td>
                <td>
                  <div class="flex items-center">
                    <span class="mr-2 text-neutral-content">{{ format.messages(item.tx.body.messages) }}</span>
                    <Icon v-if="item.code === 0" icon="mdi-check-circle-outline" class="text-success text-xl" />
                    <Icon v-else icon="mdi-close-circle-outline" class="text-error text-xl" />
                  </div>
                </td>
                <td class="text-neutral-content">{{ format.toDay(item.timestamp, 'from') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="mt-6 bg-base-100 shadow-md rounded-box p-4">
      <div class="card-body p-0">
        <h2 class="card-title text-lg font-semibold text-base-content mb-4">
          <div class="tabs tabs-boxed bg-base-200">
            <a
              role="tab"
              class="tab text-neutral-content"
              :class="{ 'tab-active': selectedEventType === EventType.Delegate }"
              @click="loadPowerEvents(1, EventType.Delegate)"
              >{{ $t('account.btn_delegate') }}</a
            >
            <a
              role="tab"
              class="tab text-neutral-content"
              :class="{ 'tab-active': selectedEventType === EventType.Unbond }"
              @click="loadPowerEvents(1, EventType.Unbond)"
              >{{ $t('account.btn_unbond') }}</a
            >
          </div>
        </h2>
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th class="text-left text-base-content font-semibold">{{ $t('account.delegator') }}</th>
                <th class="text-left text-base-content font-semibold">{{ $t('account.amount') }}</th>
                <th class="text-left text-base-content font-semibold">
                  {{ $t('account.height') }} / {{ $t('account.time') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in events.tx_responses" :key="item.txhash">
                <td class="pr-2 truncate text-primary link link-hover" style="max-width: 250px">
                  <RouterLink
                    v-for="d in mapDelegators(item.tx?.body?.messages)"
                    :to="`/${props.chain}/account/${d}`"
                    :key="d"
                  >
                    {{ d }}
                  </RouterLink>
                </td>
                <td>
                  <div
                    class="flex items-center"
                    :class="{
                      'text-success': selectedEventType === EventType.Delegate,
                      'text-error': selectedEventType === EventType.Unbond,
                    }"
                  >
                    <RouterLink :to="`/${props.chain}/tx/${item.txhash}`">
                      <span class="mr-2">
                        {{ selectedEventType === EventType.Delegate ? '+' : '-' }} {{ mapEvents(item.events) }}</span
                      >
                    </RouterLink>
                    <Icon v-if="item.code === 0" icon="mdi-check-circle-outline" class="text-success text-xl" />
                    <Icon v-else icon="mdi-close-circle-outline" class="text-error text-xl" />
                  </div>
                </td>
                <td class="text-neutral-content">
                  <RouterLink class="text-primary link link-hover" :to="`/${props.chain}/block/${item.height}`">{{
                    item.height
                  }}</RouterLink
                  ><br />
                  <span class="text-xs">{{ format.toDay(item.timestamp, 'from') }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <PaginationBar :total="events.pagination?.total" :limit="page.limit" :callback="pagePowerEvents" class="mt-4" />
      </div>
    </div>
    <!-- end -->
    <div class="toast toast-end z-50" v-show="showCopyToast === 1">
      <div class="alert alert-success">
        <div class="text-xs md:text-sm">
          <span>{{ tipMsg.msg }}</span>
        </div>
      </div>
    </div>
    <div class="toast toast-end z-50" v-show="showCopyToast === 2">
      <div class="alert alert-error">
        <div class="text-xs md:text-sm">
          <span>{{ tipMsg.msg }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.table :where(th, td) {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
