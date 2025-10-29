<script lang="ts" setup>
import { useBaseStore, useBlockchain, useFormatter } from '@/stores';
import type { Connection } from '@/types';
import { computed } from 'vue';
import { onMounted, ref } from 'vue';

const props = defineProps(['chain']);
const chainStore = useBlockchain();
const baseStore = useBaseStore();
const endpoint = ref(chainStore.current?.endpoints?.rest?.at(0)?.address);

const chainId = computed(() => baseStore.latest?.block?.header?.chain_id || '');
const chainName = computed(() => chainStore?.current?.prettyName || '');
const hdPath = computed(() => {
  return `m/44'/${chainStore.current?.coinType}/0/0/0`;
});

onMounted(() => {
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'https://unpkg.com/ping-widget@latest/dist/ping-widget.js';
  document.head.appendChild(script);
});
</script>
<template>
  <div>
    <div class="bg-base-100 shadow-md rounded-box p-4 mb-6">
      <h2 class="text-2xl font-bold text-base-content mb-3">{{ $t('widget.title') }}</h2>
      <div class="my-4">
        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text text-base-content">{{ $t('widget.endpoint') }}</span>
          </label>
          <select v-model="endpoint" class="select select-bordered w-full bg-base-200 text-base-content">
            <option disabled>{{ $t('widget.select_endpoint') }}</option>
            <option v-for="v in chainStore.current?.endpoints.rest" :value="v.address" :key="v.address">{{ v.address }}</option>
          </select>
        </div>
      </div>
      <p class="text-base text-neutral-content mb-4">{{ $t('widget.text_1') }}</p>
      <div class="mockup-code bg-base-200 text-base-content my-2">
        <pre data-prefix="1" v-pre><code class="text-info"><!-- The ping-widget script is loaded dynamically --></code></pre>
      </div>
    </div>
    <div class="bg-base-100 shadow-md rounded-box p-4 my-6">
      <h2 class="text-2xl font-bold text-base-content mb-4">{{ $t('module.widget') }}</h2>
      <div class="mt-4 space-y-6">
        <div>
          <p class="text-base text-neutral-content mb-2">1. {{ $t('widget.text_2') }}</p>
          <div class="mockup-code bg-base-200 text-base-content my-2">
            <pre data-prefix=">" v-pre><code class="text-success"><!-- This widget is optional. --> </code></pre>
            <pre data-prefix=">" v-pre><code class="text-info"><ping-connect-wallet chain-id="{{ chainId }}" hd-path="{{ hdPath }}"/></code></pre>
          </div>
        </div>

        <div>
          <p class="text-base text-neutral-content mb-2">2. {{ $t('widget.text_3') }}</p>
          <div class="mockup-code bg-base-200 text-base-content my-2">
            <pre data-prefix=">" v-pre><code class="text-info"><ping-token-convert chain-name="{{ chainName }}" endpoint="{{endpoint}}" hd-path="{{hdPath}}"/></code></pre>
            <pre data-prefix=">" v-pre><code class="text-info"><label for="PingTokenConvert" class="btn btn-sm btn-primary capitalize text-primary-content">Buy {{chainName.toUpperCase()}}</label></code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<route>
    {
      meta: {
        i18n: 'widget',
        order: 300
      }
    }
</route>
