<script lang="ts" setup>
import ApexCharts from 'vue3-apexcharts';
import { computed, ref } from '@vue/reactivity';
import { useBaseStore } from '@/stores';
import { getTxsInBlocksChartConfig } from './apexChartConfig'; // Import the new config function

const baseStore = useBaseStore();

const currentTheme = computed(() => {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
});

const options = computed(() => {
  const categories = baseStore.recents
    .slice(0, 50)
    .map((x) => x.block.header.height)
    .reverse(); // Reverse to show latest blocks on the right

  const chartOptions = getTxsInBlocksChartConfig(currentTheme.value, categories);
  return chartOptions;
});

const series = computed(() => {
  const data = baseStore.recents?.map((x) => x.block.data.txs.length).reverse() || []; // Reverse data as well
  const chartSeries = [
    {
      name: 'Txs',
      data: data,
    },
  ];
  return chartSeries;
});
</script>

<template>
  <ApexCharts type="bar" height="150" :options="options" :series="series" />
</template>
