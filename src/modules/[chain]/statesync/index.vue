<script lang="ts" setup>
import { useBaseStore, useBlockchain, useFormatter } from '@/stores';
import type { NodeInfo } from '@/types';
import { fromBase64, toHex } from '@cosmjs/encoding';
import { onMounted, ref } from 'vue';
import { computed } from 'vue';

const props = defineProps(['hash', 'chain']);
const blockchain = useBlockchain();
const base = useBaseStore();
const nodeInfo = ref({} as NodeInfo);

const height = ref(0);
const hash = ref('');

base.$subscribe((m, { latest }) => {
  let h = Number(latest.block?.header?.height);
  h = Math.round((h - 2000) / 1000) * 1000;
  if (h > height.value) {
    height.value = h;
    base.fetchBlock(h).then((res) => {
      hash.value = toHex(fromBase64(res.block_id.hash)).toUpperCase();
    });
  }
});

const rpcs = computed(() => {
  return blockchain.current?.endpoints?.rpc?.map((x) => x.address).join(',');
});

const appName = computed(() => {
  return nodeInfo.value.application_version?.app_name || 'gaiad';
});

onMounted(() => {
  blockchain.rpc.getBaseNodeInfo().then((x) => {
    nodeInfo.value = x;
  });
});
</script>
<template>
  <div>
    <div class="bg-base-100 shadow-md rounded-box p-4 mb-6">
      <h2 class="text-2xl font-bold text-base-content mb-3">{{ $t('statesync.title') }}</h2>
      <p class="text-neutral-content text-base">
        {{ $t('statesync.description') }}
        <a class="text-primary link link-hover lowercase" href="https://blog.cosmos.network/cosmos-sdk-state-sync-guide-99e4cf43be2f" target="_blank" rel="noopener noreferrer"
          >{{ $t('statesync.here') }}&nbsp;</a
        >
        <span class="lowercase"> {{ $t('statesync.for_more_info') }}.</span>
      </p>
    </div>

    <div class="bg-base-100 shadow-md rounded-box p-4 mb-6">
      <h2 class="text-xl font-bold text-base-content mb-4">{{ $t('statesync.title_2') }}</h2>
      <div class="text-neutral-content text-base space-y-4">
        <p>
          1. {{ $t('statesync.text_1') }} ({{ appName }}
          {{ $t('statesync.version') }}:
          <span class="font-semibold">{{ nodeInfo.application_version?.version || '' }}</span
          >)<br />
          {{ $t('statesync.text_1_1') }}.
        </p>
        <p>
          2. {{ $t('statesync.text_2') }}<br />
          {{ $t('statesync.text_2_1') }}.
        </p>
        <div class="mockup-code bg-base-200 text-base-content my-4">
          <pre data-prefix=">"><code class="text-info">[state-sync]</code></pre>
          <pre data-prefix=">"><code class="text-info">enable = true</code></pre>
          <pre data-prefix=">"><code class="text-info"></code></pre>
          <pre data-prefix=">"><code class="text-info">rpc_servers = "{{ rpcs }}"</code></pre>
          <pre data-prefix=">"><code class="text-info">trust_height = {{ height }} </code></pre>
          <pre data-prefix=">"><code class="text-info">trust_hash = "{{ hash }}"</code></pre>
          <pre data-prefix=">"><code class="text-info"></code></pre>
          <pre data-prefix=">"><code class="text-success"># 2/3 of unbonding time</code></pre>
          <pre data-prefix=">"><code class="text-info">trust_period = "168h"</code></pre>
        </div>
        <p>
          3. {{ $t('statesync.text_3') }}:
          <code class="bg-base-200 text-primary px-2 py-1 mx-1 rounded-md shadow-sm">{{ appName }} start</code>
          <br />
          {{ $t('statesync.text_3_1') }}
          <code class="bg-base-200 text-primary px-2 py-1 mx-1 rounded-md shadow-sm">{{ appName }} unsafe-reset-all</code> or
          <code class="bg-base-200 text-primary px-2 py-1 mx-1 rounded-md shadow-sm"
            >{{ appName }} tendermint unsafe-reset-all --home ~/.HOME</code
          >
          {{ $t('statesync.text_3_2') }}.
        </p>
      </div>
    </div>

    <div class="bg-base-100 shadow-md rounded-box p-4">
      <h2 class="text-xl font-bold text-base-content mb-4">{{ $t('statesync.title_3') }}</h2>
      <div class="text-neutral-content text-base space-y-4">
        <p>{{ $t('statesync.text_title_3') }}</p>
        <div class="mockup-code bg-base-200 text-base-content my-4">
          <pre data-prefix=">"><code class="text-success"># snapshot-interval specifies the block interval at which local state sync snapshots are</code></pre>
          <pre data-prefix=">"><code class="text-success"># taken (0 to disable). Must be a multiple of pruning-keep-every.</code></pre>
          <pre data-prefix=">"><code class="text-info">snapshot-interval = 1000</code></pre>
          <pre data-prefix=">"><code class="text-info"></code></pre>
          <pre data-prefix=">"><code class="text-success"># snapshot-keep-recent specifies the number of recent snapshots to keep and serve (0 to keep all). Each snapshot is about 500MiB</code></pre>
          <pre data-prefix=">"><code class="text-info">snapshot-keep-recent = 2</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<route>
    {
      meta: {
        i18n: 'state-sync'
      }
    }
  </route>
