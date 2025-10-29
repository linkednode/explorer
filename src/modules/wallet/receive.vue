<script setup lang="ts">
import { useWalletStore } from '@/stores';
import { useQRCode } from '@vueuse/integrations/useQRCode';

const walletStore = useWalletStore();
const qrcode = useQRCode(walletStore.currentAddress);
</script>

<template>
  <div class="bg-base-100 shadow-md rounded-box p-6 text-center">
    <h2 class="text-2xl font-bold text-base-content mb-6">{{ $t('wallet.pay_me') }}</h2>
    <div
      v-if="walletStore.currentAddress"
      class="flex items-center justify-center mt-8 mb-4"
    >
      <img :src="qrcode" alt="QR Code" class="rounded-lg overflow-hidden w-64 h-64 border-4 border-base-200 p-2" />
    </div>
    <div class="text-base-content font-mono text-lg break-all px-4">
      {{ walletStore.currentAddress }}
    </div>
    <div class="mt-6">
      <button class="btn btn-primary capitalize text-primary-content px-10">
        {{ $t('wallet.go_to_pay') }}
      </button>
    </div>
  </div>
</template>
