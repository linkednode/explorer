<script lang="ts" setup>
import { useDashboard } from '@/stores';
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});

const dashboardStore = useDashboard();
const conf = computed(() => dashboardStore.chains[props.name] || {});

const addFavor = (e: Event) => {
  e.stopPropagation();
  e.preventDefault();
  dashboardStore.favoriteMap[props.name] = !dashboardStore?.favoriteMap?.[props.name];
  window.localStorage.setItem('favoriteMap', JSON.stringify(dashboardStore.favoriteMap));
};
</script>
<template>
  <RouterLink
    :to="`/${name}`"
    class="bg-base-100 hover:bg-base-200 rounded-box shadow-md flex items-center px-4 py-3 cursor-pointer transition-colors duration-200"
  >
    <div class="w-9 h-9 rounded-full overflow-hidden">
      <img :src="conf.logo" />
    </div>
    <div class="font-semibold ml-4 text-lg flex-1 truncate capitalize text-base-content">
      {{ conf?.prettyName || props.name }}
    </div>
    <div
      @click="addFavor"
      class="pl-4 text-xl"
      :class="{
        'text-warning': dashboardStore?.favoriteMap?.[props.name],
        'text-neutral-content': !dashboardStore?.favoriteMap?.[props.name],
      }"
    >
      <Icon icon="mdi-star" />
    </div>
  </RouterLink>
</template>
