<script setup lang="ts">
import { ref } from 'vue';
import { useDashboard, useBlockchain } from '@/stores';
import type { ChainConfig, DenomUnit } from '@/types/chaindata';
import { CosmosRestClient } from '@/libs/client';
import { onMounted } from 'vue';
import AdBanner from '@/components/ad/AdBanner.vue';

const error = ref('');
const conf = ref('');
const dashboard = useDashboard();
const selected = ref({} as ChainConfig);

onMounted(() => {
  const chainStore = useBlockchain();
  selected.value = chainStore.current || Object.values(dashboard.chains)[0];
  initParamsForKeplr();
});
async function initParamsForKeplr() {
  const chain = selected.value;
  if (!chain.endpoints?.rest?.at(0)) throw new Error('Endpoint does not set');
  const client = CosmosRestClient.newDefault(chain.endpoints.rest?.at(0)?.address || '');
  const b = await client.getBaseBlockLatest();
  const chainid = b.block.header.chain_id;

  const gasPriceStep = chain.keplrPriceStep || {
    low: 0.01,
    average: 0.025,
    high: 0.03,
  };
  const coinDecimals =
    chain.assets[0].denom_units.find((x: DenomUnit) => x.denom === chain.assets[0].symbol.toLowerCase())?.exponent || 6;
  conf.value = JSON.stringify(
    {
      chainId: chainid,
      chainName: chain.chainName,
      rpc: chain.endpoints?.rpc?.at(0)?.address,
      rest: chain.endpoints?.rest?.at(0)?.address,
      bip44: {
        coinType: Number(chain.coinType),
      },
      coinType: Number(chain.coinType),
      bech32Config: {
        bech32PrefixAccAddr: chain.bech32Prefix,
        bech32PrefixAccPub: `${chain.bech32Prefix}pub`,
        bech32PrefixValAddr: `${chain.bech32Prefix}valoper`,
        bech32PrefixValPub: `${chain.bech32Prefix}valoperpub`,
        bech32PrefixConsAddr: `${chain.bech32Prefix}valcons`,
        bech32PrefixConsPub: `${chain.bech32Prefix}valconspub`,
      },
      currencies: [
        {
          coinDenom: chain.assets[0].symbol,
          coinMinimalDenom: chain.assets[0].base,
          coinDecimals,
          coinGeckoId: chain.assets[0].coingecko_id || 'unknown',
        },
      ],
      feeCurrencies: [
        {
          coinDenom: chain.assets[0].symbol,
          coinMinimalDenom: chain.assets[0].base,
          coinDecimals,
          coinGeckoId: chain.assets[0].coingecko_id || 'unknown',
          gasPriceStep,
        },
      ],
      gasPriceStep,
      stakeCurrency: {
        coinDenom: chain.assets[0].symbol,
        coinMinimalDenom: chain.assets[0].base,
        coinDecimals,
        coinGeckoId: chain.assets[0].coingecko_id || 'unknown',
      },
      features: chain.keplrFeatures || [],
    },
    null,
    '\t'
  );
}

function suggest() {
  // @ts-ignore
  if (window.keplr) {
    // @ts-ignore
    window.keplr.experimentalSuggestChain(JSON.parse(conf.value)).catch((e) => {
      error.value = e;
    });
  }
}
</script>

<template>
  <div class="bg-base-100 shadow-md rounded-box p-4 text-center">
    <AdBanner id="keplr-banner-ad" unit="banner" width="970px" height="90px" />
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 my-6">
      <select v-model="selected" class="select select-bordered w-full max-w-xs bg-base-200 text-base-content" @change="initParamsForKeplr">
        <option v-for="c in dashboard.chains" :value="c" :key="c.chainName">
          {{ c.chainName }}
        </option>
      </select>
      <button class="btn btn-primary capitalize text-primary-content w-full sm:w-auto" @click="suggest">
        Add {{ selected.chainName }} TO Keplr Wallet
      </button>
    </div>
    <div class="form-control w-full">
      <label class="label">
        <span class="label-text text-base-content">{{ $t('wallet.keplr_config') }}</span>
      </label>
      <textarea v-model="conf" class="textarea textarea-bordered h-64 bg-base-200 text-base-content font-mono text-xs" readonly></textarea>
    </div>
    <p class="text-sm text-neutral-content mt-4">
      {{ $t('wallet.keplr_info') }}
    </p>
  </div>
</template>

<route>
    {
      meta: {
        i18n: 'keplr',
        order: 100
      }
    }
</route>
