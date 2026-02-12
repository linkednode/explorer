<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useBaseStore, useBlockchain, useWalletStore } from '@/stores';
import { Icon } from '@iconify/vue';
import { ref, computed } from 'vue';

const route = useRoute();
const walletStore = useWalletStore();
const chainStore = useBlockchain();
const baseStore = useBaseStore();
// walletStore.$subscribe((m, s) => {
//   console.log(m, s);
// });
function walletStateChange(res: any) {
  walletStore.setConnectedWallet(res.detail?.value);
}
let showCopyToast = ref(0);
async function copyAdress(address: string) {
  try {
    await navigator.clipboard.writeText(address);
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
}
const tipMsg = computed(() => {
  return showCopyToast.value === 2
    ? { class: 'error', msg: 'Copy Error!' }
    : { class: 'success', msg: 'Copy Success!' };
});

const params = computed(() => {
  if (chainStore.chainName == 'side') {
    return JSON.stringify({
      wallet: ['okex', 'unisat'],
    });
  }
  return '';
});
</script>

<template>
  <div class="dropdown dropdown-hover dropdown-end">
    <!-- Wallet Button -->
    <label
      tabindex="0"
      class="btn btn-sm m-1 gap-2 !inline-flex text-xs md:!text-sm transition-all duration-200"
      :class="walletStore.currentAddress 
        ? 'btn-outline btn-primary hover:btn-primary' 
        : 'btn-primary text-primary-content shadow-sm hover:shadow-md'"
    >
      <div 
        v-if="walletStore.currentAddress" 
        class="w-2 h-2 rounded-full bg-success animate-pulse"
      ></div>
      <Icon v-else icon="mdi:wallet" class="text-base" />
      <span class="hidden md:block font-medium">
        {{ walletStore.shortAddress || 'Connect' }}
      </span>
    </label>
    
    <!-- Dropdown Content -->
    <div
      tabindex="0"
      class="dropdown-content z-50 shadow-strong border border-base-300/50 p-3 bg-base-100 rounded-xl w-64 md:!w-72 overflow-hidden"
    >
      <!-- Connect Button (when not connected) -->
      <label
        v-if="!walletStore?.currentAddress"
        for="PingConnectWallet"
        class="btn btn-primary w-full gap-2 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <Icon icon="mdi:wallet-plus" class="text-lg" />
        <span>Connect Wallet</span>
      </label>
      
      <!-- Connected State -->
      <div v-if="walletStore.currentAddress">
        <!-- Wallet Info Header -->
        <div class="flex items-center gap-3 mb-3 pb-3 border-b border-base-300/50">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Icon icon="mdi:wallet" class="text-xl text-primary" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-base-content capitalize">
              {{ walletStore.connectedWallet?.wallet || 'Wallet' }}
            </div>
            <div class="text-xs text-success flex items-center gap-1">
              <div class="w-1.5 h-1.5 rounded-full bg-success"></div>
              Connected
            </div>
          </div>
        </div>
        
        <!-- Address -->
        <button
          class="w-full p-3 bg-base-200/50 hover:bg-base-200 rounded-lg cursor-pointer transition-colors duration-150 text-left group mb-3"
          @click="copyAdress(walletStore.currentAddress)"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-base-content/60 font-medium">Address</span>
            <Icon icon="mdi:content-copy" class="text-sm text-base-content/40 group-hover:text-primary transition-colors" />
          </div>
          <div class="text-xs text-base-content font-mono break-all leading-relaxed">
            {{ walletStore.currentAddress }}
          </div>
        </button>
        
        <!-- Navigation Links -->
        <div class="space-y-1 mb-3">
          <RouterLink to="/wallet/accounts" class="block">
            <div class="flex items-center gap-3 py-2.5 px-3 hover:bg-base-200 rounded-lg cursor-pointer transition-colors duration-150 group">
              <Icon icon="mdi:account-multiple" class="text-lg text-base-content/60 group-hover:text-primary transition-colors" />
              <span class="text-sm font-medium text-base-content">Accounts</span>
              <Icon icon="mdi:chevron-right" class="text-base text-base-content/30 ml-auto group-hover:text-primary transition-colors" />
            </div>
          </RouterLink>
          <RouterLink to="/wallet/portfolio" class="block">
            <div class="flex items-center gap-3 py-2.5 px-3 hover:bg-base-200 rounded-lg cursor-pointer transition-colors duration-150 group">
              <Icon icon="mdi:chart-pie" class="text-lg text-base-content/60 group-hover:text-primary transition-colors" />
              <span class="text-sm font-medium text-base-content">Portfolio</span>
              <Icon icon="mdi:chevron-right" class="text-base text-base-content/30 ml-auto group-hover:text-primary transition-colors" />
            </div>
          </RouterLink>
        </div>
        
        <!-- Disconnect Button -->
        <button
          class="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-error hover:bg-error/10 rounded-lg cursor-pointer transition-colors duration-150 text-sm font-medium"
          @click="walletStore.disconnect()"
        >
          <Icon icon="mdi:logout" class="text-base" />
          Disconnect
        </button>
      </div>
    </div>
    
    <!-- Toast Notifications -->
    <div class="toast toast-end z-50" v-show="showCopyToast === 1">
      <div class="alert alert-success shadow-lg border-0 gap-2">
        <Icon icon="mdi:check-circle" class="text-lg" />
        <span class="text-sm font-medium">{{ tipMsg.msg }}</span>
      </div>
    </div>
    <div class="toast toast-end z-50" v-show="showCopyToast === 2">
      <div class="alert alert-error shadow-lg border-0 gap-2">
        <Icon icon="mdi:alert-circle" class="text-lg" />
        <span class="text-sm font-medium">{{ tipMsg.msg }}</span>
      </div>
    </div>
  </div>
  
  <Teleport to="body">
    <ping-connect-wallet
      :chain-id="baseStore.currentChainId || 'cosmoshub-4'"
      :hd-path="chainStore.defaultHDPath"
      :addr-prefix="chainStore.current?.bech32Prefix || 'cosmos'"
      @connect="walletStateChange"
      @keplr-config="walletStore.suggestChain()"
      :params="params"
    />
  </Teleport>
</template>

<style>
.ping-connect-btn,
.ping-connect-dropdown {
  display: none !important;
}
</style>
