<script setup lang="ts">
import { themeChange } from 'theme-change';
import { onMounted } from 'vue';
import TxDialog from './components/TxDialog.vue';
import StickyBannerDemo from './components/StickyBannerDemo.vue';

onMounted(() => {
  themeChange(false);
});
</script>

<template>
  <div>
    <StickyBannerDemo />
    <RouterView />
    <TxDialog />
  </div>
</template>
