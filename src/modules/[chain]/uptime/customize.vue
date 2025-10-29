<script lang="ts" setup>
import { ref, onMounted, computed, watchEffect } from 'vue';
import { fromHex, toBase64 } from '@cosmjs/encoding';
import { Icon } from '@iconify/vue';
import { useFormatter, useStakingStore, useBaseStore, useBlockchain, useDashboard } from '@/stores';
import UptimeBar from '@/components/UptimeBar.vue';
import type { Block, Commit } from '@/types';
import { consensusPubkeyToHexAddress, valconsToBase64 } from '@/libs';
import type { SigningInfo } from '@/types/slashing';
import { CosmosRestClient } from '@/libs/client';

const props = defineProps(['chain']);

const stakingStore = useStakingStore();
const format = useFormatter();
const chainStore = useBlockchain();
const dashboard = useDashboard();
// storage local favorite validator ids
const local = ref(
  JSON.parse(localStorage.getItem('uptime-validators') || '{}') as Record<string, { name: string; address: string }[]>
);
const signingInfo = ref({} as Record<string, SigningInfo[]>);
const selected = ref([] as string[]);
const selectChain = ref(chainStore.chainName);
const validators = ref(stakingStore.validators);
const keyword = ref('');

function loadSigningInfo(chainName: string) {
  const chain = dashboard.chains[chainName];
  if (chain && chain.endpoints.rest) {
    const client = CosmosRestClient.newDefault(chain.endpoints.rest[0].address);
    client.getSlashingSigningInfos().then((resp) => {
      signingInfo.value[chainName] = resp.info;
    });
  }
}
if (local.value)
  Object.keys(local.value).map((chainName) => {
    loadSigningInfo(chainName);
  });

function initial() {
  const vals = local.value[selectChain.value];
  if (vals) {
    selected.value = vals.map((x) => x.address);
  }
}

const filterValidators = computed(() => {
  if (keyword.value) {
    return validators.value.filter((x) => x.description.moniker.indexOf(keyword.value) > -1);
  }
  return validators.value;
});

const list = computed(() => {
  const list = [] as any[];
  if (local.value)
    Object.keys(local.value).map((chainName) => {
      const vals = local.value[chainName];
      const info = signingInfo.value[chainName];
      if (vals && info) {
        vals.forEach((v) => {
          const sigingInfo = info.find((x) => valconsToBase64(x.address) === v.address);
          list.push({
            chainName,
            v,
            sigingInfo,
          });
        });
      }
    });
  return list;
});

function add() {
  if (!signingInfo.value[selectChain.value]) {
    loadSigningInfo(selectChain.value);
  }
  const newList = [] as { name: string; address: string }[];
  selected.value.forEach((x) => {
    const validator = validators.value.find((v) => consensusPubkeyToHexAddress(v.consensus_pubkey) === x);
    if (validator)
      newList.push({
        name: validator.description.moniker || x,
        address: x,
      });
  });
  if (!local.value) local.value = {};
  local.value[selectChain.value] = newList;

  localStorage.setItem('uptime-validators', JSON.stringify(local.value));
}

function changeChain() {
  validators.value = [];
  const endpoint = dashboard.chains[selectChain.value].endpoints.rest?.at(0)?.address;
  if (!endpoint) return;

  const client = CosmosRestClient.newDefault(endpoint);
  client.getStakingValidators('BOND_STATUS_BONDED').then((x) => {
    validators.value = x.validators;
  });

  const vals = local.value[selectChain.value];
  if (vals) {
    selected.value = vals.map((x) => x.address);
  } else {
    selected.value = [];
  }
}

function color(v: string) {
  if (v) {
    const n = Number(v);
    if (n < 10) return ' badge-success';
    if (n > 1000) return ' badge-error';
    if (n > 0) return ' badge-warning';
  }
}
</script>

<template>
  <div>
    <div class="bg-base-100 shadow-md rounded-box p-4 mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div class="min-w-0 flex-1">
          <h2 class="text-2xl font-bold leading-7 text-base-content sm:truncate sm:text-3xl sm:tracking-tight">
            {{ $t('uptime.my_validators') }}
          </h2>
          <div class="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div class="mt-2 flex items-center text-sm text-neutral-content">
              <Icon icon="mdi:monitor-dashboard" class="mr-1.5 h-5 w-5 flex-shrink-0 text-primary" />
              {{ $t('uptime.add_validators_monitor') }}
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto mt-6">
        <table class="table w-full table-zebra">
          <thead class="bg-base-200">
            <tr>
              <th class="text-left uppercase text-base-content font-semibold">{{ $t('uptime.no') }}</th>
              <th class="text-left uppercase text-base-content font-semibold">Blockchain</th>
              <th class="text-left uppercase text-base-content font-semibold">{{ $t('account.validator') }}</th>
              <th class="text-right uppercase text-base-content font-semibold">{{ $t('uptime.signed_blocks') }}</th>
              <th class="text-left uppercase text-base-content font-semibold">{{ $t('uptime.last_jailed_time') }}</th>
              <th class="text-left uppercase text-base-content font-semibold">{{ $t('uptime.tombstoned') }}</th>
              <th class="text-right uppercase text-base-content font-semibold">{{ $t('uptime.missing_blocks') }}</th>
              <th class="text-center uppercase text-base-content font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(v, i) in list" :key="v.v.address" class="hover:bg-base-200 transition-colors duration-200">
              <td class="text-neutral-content">{{ i + 1 }}</td>
              <td class="capitalize text-base-content font-medium">{{ v.chainName }}</td>
              <td class="text-primary link link-hover">
                <RouterLink :to="`/${v.chainName}/staking/${v.v.address}`">{{ v.v.name }}</RouterLink>
              </td>
              <td class="text-right text-neutral-content">
                <span v-if="v.sigingInfo">{{
                  Number(v.sigingInfo.index_offset) - Number(v.sigingInfo.start_height)
                }}</span>
                <span v-else>-</span>
              </td>
              <td>
                <div
                  v-if="v.sigingInfo && !v.sigingInfo?.jailed_until.startsWith('1970')"
                  class="flex flex-col"
                >
                  <span class="text-neutral-content">{{ format.toLocaleDate(v.sigingInfo?.jailed_until) }}</span>
                  <span class="badge badge-ghost text-xs mt-1">{{ format.toDay(v.sigingInfo.jailed_until, 'from') }}</span>
                </div>
                <span v-else class="text-neutral-content">-</span>
              </td>
              <td class="capitalize text-neutral-content">{{ v.sigingInfo?.tombstoned ? 'Yes' : 'No' }}</td>
              <td class="text-right">
                <span v-if="v.sigingInfo" class="badge" :class="color(v.sigingInfo?.missed_blocks_counter)">{{
                  v.sigingInfo?.missed_blocks_counter
                }}</span>
                <span v-else class="text-neutral-content">-</span>
              </td>
              <td class="text-center">
                <RouterLink :to="`/${v.chainName}/uptime/#blocks`" class="btn btn-xs btn-primary capitalize text-primary-content">{{
                  $t('module.blocks')
                }}</RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="text-center mt-6">
      <label for="add-validator" class="btn btn-primary capitalize text-primary-content">{{
        $t('uptime.add_validators')
      }}</label>
    </div>

    <input type="checkbox" id="add-validator" class="modal-toggle" @change="initial" />
    <div class="modal">
      <div class="modal-box relative w-11/12 max-w-2xl">
        <label for="add-validator" class="btn btn-sm btn-circle absolute right-4 top-4">✕</label>
        <h3 class="text-xl font-bold text-base-content mb-4">{{ $t('uptime.add_validators') }}</h3>
        <div class="form-control my-5">
          <div class="input-group">
            <select v-model="selectChain" class="select select-bordered capitalize bg-base-200 text-base-content" @change="changeChain">
              <option v-for="c in dashboard.chains" :value="c.chainName" :key="c.chainName">
                {{ c.chainName }}
              </option>
            </select>
            <input v-model="keyword" type="text" class="input input-bordered w-full bg-base-200 text-base-content" :placeholder="$t('uptime.filter_validator_placeholder')" />
          </div>
        </div>
        <div class="py-4 max-h-80 overflow-y-auto bg-base-200 rounded-box">
          <table class="table w-full table-zebra">
            <thead>
              <tr>
                <th class="text-left uppercase text-base-content font-semibold">{{ $t('account.validator') }}</th>
                <th class="text-center uppercase text-base-content font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(v, i) in filterValidators" :key="v.operator_address" class="hover:bg-base-300 transition-colors duration-200">
                <td>
                  <label :for="v.operator_address" class="flex items-center cursor-pointer">
                    <span class="text-base-content font-medium">{{ i + 1 }}. {{ v.description.moniker }}</span>
                  </label>
                </td>
                <td class="text-center">
                  <input
                    :id="v.operator_address"
                    v-model="selected"
                    class="checkbox checkbox-primary"
                    type="checkbox"
                    :value="consensusPubkeyToHexAddress(v.consensus_pubkey)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-action mt-6">
          <label class="btn btn-primary capitalize text-primary-content" @click="add">{{
            $t('uptime.add')
          }}</label>
        </div>
      </div>
    </div>
    <div class="h-6"></div>
  </div>
</template>
