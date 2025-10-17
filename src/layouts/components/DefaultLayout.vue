<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { computed, ref } from 'vue';

// Components
import newFooter from '@/layouts/components/NavFooter.vue';
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue';
import NavbarSearch from '@/layouts/components/NavbarSearch.vue';
import ChainProfile from '@/layouts/components/ChainProfile.vue';
import Sponsors from '@/layouts/components/Sponsors.vue';

import { useDashboard } from '@/stores/useDashboard';
import { NetworkType } from '@/types/chaindata';
import { useBaseStore, useBlockchain } from '@/stores';

import NavBarI18n from './NavBarI18n.vue';
import NavBarWallet from './NavBarWallet.vue';
import type {
  NavGroup,
  NavLink,
  NavSectionTitle,
  VerticalNavItems,
} from '../types';
import dayjs from 'dayjs';
import AdBanner from '@/components/ad/AdBanner.vue';

const dashboard = useDashboard();
dashboard.initial();
const blockchain = useBlockchain();
blockchain.randomSetupEndpoint();
const baseStore = useBaseStore();

const current = ref(''); // the current chain
const temp = ref('');
blockchain.$subscribe((m, s) => {
  if (current.value === s.chainName && temp.value != s.endpoint.address) {
    temp.value = s.endpoint.address;
    blockchain.initial();
  }
  if (current.value != s.chainName) {
    current.value = s.chainName;
    blockchain.randomSetupEndpoint();
  }
});

const sidebarShow = ref(false);
const sidebarOpen = ref(true);

const changeOpen = (index: Number) => {
  if (index === 0) {
    sidebarOpen.value = !sidebarOpen.value;
  }
};
const showDiscord = window.location.host.search('ping.pub') > -1;

function isNavGroup(nav: VerticalNavItems | any): nav is NavGroup {
  return (<NavGroup>nav).children !== undefined;
}
function isNavLink(nav: VerticalNavItems | any): nav is NavLink {
  return (<NavLink>nav).to !== undefined;
}
function isNavTitle(nav: VerticalNavItems | any): nav is NavSectionTitle {
  return (<NavSectionTitle>nav).heading !== undefined;
}
function selected(route: any, nav: NavLink) {
  const b =
    route.path === nav.to?.path || (route.path.startsWith(nav.to?.path) && nav.title.indexOf('dashboard') === -1);
  return b;
}
const blocktime = computed(() => {
  return dayjs(baseStore.latest?.block?.header?.time);
});

const behind = computed(() => {
  const current = dayjs().subtract(10, 'minute');
  return blocktime.value.isBefore(current);
});

dayjs();

const show_ad = computed(() => {
  return location.hostname.indexOf('ping.pub') > -1;
});
</script>

<template>
  <div class="flex min-h-screen bg-base-200">
    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-br from-base-100 to-base-200 shadow-2xl transform -translate-x-full xl:translate-x-0 transition-transform duration-300 ease-in-out border-r border-base-300"
      :class="{ 'translate-x-0': sidebarShow }"
    >
      <div class="flex items-center justify-between p-5 border-b border-base-300 bg-primary text-primary-content">
        <RouterLink to="/" class="flex items-center gap-3">
          <img class="w-10 h-10 animate-pulse" src="../../assets/logo.svg" alt="LinkedNode Logo" />
          <h1 class="text-2xl font-extrabold tracking-wider">LinkedNode</h1>
        </RouterLink>
        <button
          class="btn btn-ghost btn-circle xl:hidden text-primary-content hover:bg-primary-focus"
          @click="sidebarShow = false"
        >
          <Icon icon="mdi-close" class="text-2xl" />
        </button>
      </div>
      <nav class="h-[calc(100%-76px)] overflow-y-auto custom-scrollbar">
        <ul class="menu p-4 text-base-content space-y-1">
          <template v-for="(item, index) of blockchain.computedChainMenu" :key="index">
            <li v-if="isNavGroup(item)">
              <details :open="index === 0 && sidebarOpen">
                <summary
                  class="flex items-center gap-3 text-lg font-medium rounded-lg p-3 cursor-pointer hover:bg-base-300 transition-colors duration-200"
                  :class="{ 'text-primary font-semibold bg-base-300': selected($route, item) }"
                  @click="changeOpen(index)"
                >
                  <Icon v-if="item?.icon?.icon" :icon="item?.icon?.icon" class="text-xl text-accent" />
                  <img v-if="item?.icon?.image" :src="item?.icon?.image" class="w-6 h-6 rounded-full" />
                  <span class="flex-1">{{ item?.title }}</span>
                  <span v-if="item?.badgeContent" :class="item?.badgeClass" class="badge badge-sm">{{ item?.badgeContent }}</span>
                </summary>
                <ul class="ml-4 space-y-1">
                  <li v-for="(el, key) of item?.children" :key="key">
                    <RouterLink
                      v-if="isNavLink(el)"
                      @click="sidebarShow = false"
                      :to="el.to"
                      class="flex items-center gap-3 text-base rounded-lg p-3 cursor-pointer hover:bg-base-300 transition-colors duration-200"
                      :class="{ 'active bg-primary text-primary-content hover:bg-primary-focus': selected($route, el) }"
                    >
                      <Icon v-if="!el?.icon?.image" icon="mdi:chevron-right" class="text-lg text-info" />
                      <img v-if="el?.icon?.image" :src="el?.icon?.image" class="w-5 h-5 rounded-full" />
                      <span>{{ item?.title === 'Favorite' ? el?.title : $t(el?.title) }}</span>
                    </RouterLink>
                  </li>
                  <li v-if="index === 0 && dashboard.networkType === NetworkType.Testnet">
                    <RouterLink
                      @click="sidebarShow = false"
                      :to="`/${blockchain.chainName}/faucet`"
                      class="flex items-center gap-3 text-base rounded-lg p-3 cursor-pointer hover:bg-base-300 transition-colors duration-200"
                    >
                      <Icon icon="mdi:chevron-right" class="text-lg text-info"></Icon>
                      <span>Faucet</span>
                      <span class="badge badge-error badge-sm ml-auto">New</span>
                    </RouterLink>
                  </li>
                </ul>
              </details>
            </li>
            <li v-else-if="isNavLink(item)">
              <RouterLink
                :to="item?.to"
                @click="sidebarShow = false"
                class="flex items-center gap-3 text-lg font-medium rounded-lg p-3 cursor-pointer hover:bg-base-300 transition-colors duration-200"
                :class="{ 'active bg-primary text-primary-content hover:bg-primary-focus': selected($route, item) }"
              >
                <Icon v-if="item?.icon?.icon" :icon="item?.icon?.icon" class="text-xl text-accent" />
                <img v-if="item?.icon?.image" :src="item?.icon?.image" class="w-6 h-6 rounded-full" />
                <span class="flex-1">{{ item?.title }}</span>
                <span v-if="item?.badgeContent" :class="item?.badgeClass" class="badge badge-sm">{{ item?.badgeContent }}</span>
              </RouterLink>
            </li>
            <li v-else-if="isNavTitle(item)" class="menu-title text-xs uppercase mt-5 mb-2 text-neutral-content px-4 tracking-wide">
              <span>{{ item?.heading }}</span>
            </li>
          </template>
          <div class="divider my-3"></div>
          <li class="menu-title text-xs uppercase mt-5 mb-2 text-neutral-content px-4 tracking-wide">Tools</li>
          <li>
            <RouterLink to="/wallet/suggest" class="flex items-center gap-3 text-base rounded-lg p-3 cursor-pointer hover:bg-base-300 transition-colors duration-200">
              <Icon icon="mdi:wallet-outline" class="text-xl text-info" />
              <span>Wallet Helper</span>
            </RouterLink>
          </li>
          <li v-if="showDiscord" class="menu-title text-xs uppercase mt-5 mb-2 text-neutral-content px-4 tracking-wide">{{ $t('module.sponsors') }}</li>
          <Sponsors v-if="showDiscord" />
          <li class="menu-title text-xs uppercase mt-5 mb-2 text-neutral-content px-4 tracking-wide">{{ $t('module.links') }}</li>
          <li>
            <a href="https://twitter.com/ping_pub" target="_blank" class="flex items-center gap-3 text-base rounded-lg p-3 cursor-pointer hover:bg-base-300 transition-colors duration-200">
              <Icon icon="mdi:twitter" class="text-xl text-info" />
              <span>Twitter</span>
            </a>
          </li>
          <li v-if="showDiscord">
            <a href="https://discord.com/invite/CmjYVSr6GW" target="_blank" class="flex items-center gap-3 text-base rounded-lg p-3 cursor-pointer hover:bg-base-300 transition-colors duration-200">
              <Icon icon="mdi:discord" class="text-xl text-info" />
              <span>Discord</span>
            </a>
          </li>
          <li>
            <a href="https://github.com/ping-pub/explorer/discussions" target="_blank" class="flex items-center gap-3 text-base rounded-lg p-3 cursor-pointer hover:bg-base-300 transition-colors duration-200">
              <Icon icon="mdi:help-circle-outline" class="text-xl text-info" />
              <span>FAQ</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <main class="flex-1 xl:ml-64 p-4">
      <!-- Header -->
      <header
        class="navbar bg-base-100 shadow-lg rounded-box mb-6 p-4 flex justify-between items-center"
      >
        <div class="flex items-center gap-3">
          <button class="btn btn-square btn-ghost xl:hidden" @click="sidebarShow = true">
            <Icon icon="mdi-menu" class="text-2xl" />
          </button>
          <ChainProfile />
        </div>

        <div class="flex items-center gap-4">
          <NavBarI18n class="hidden md:flex" />
          <NavbarThemeSwitcher />
          <NavbarSearch />
          <NavBarWallet />
        </div>
      </header>

      <!-- Pages -->
      <section class="min-h-[calc(100vh-180px)] bg-base-100 p-6 rounded-box shadow-lg">
        <div v-if="behind" class="alert alert-error mb-6">
          <div class="flex gap-2 items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="stroke-current flex-shrink-0 w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span
              >{{ $t('pages.out_of_sync') }} {{ blocktime.format() }} ({{
                blocktime.fromNow()
              }})</span
            >
          </div>
        </div>
        <RouterView v-slot="{ Component }">
          <Transition mode="out-in">
            <div>
              <AdBanner v-if="show_ad" />
              <Component :is="Component" />
            </div>
          </Transition>
        </RouterView>
      </section>

      <newFooter class="mt-6" />
    </main>
  </div>
</template>
