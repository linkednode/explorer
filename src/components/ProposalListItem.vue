<script lang="ts" setup>
import { useBlockchain, useFormatter, useStakingStore, useTxDialog } from '@/stores';
import { select } from '@/components/dynamic/index';
import type { PaginatedProposals } from '@/types';
import ProposalProcess from './ProposalProcess.vue';
import type { PropType } from 'vue';
import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue';

const dialog = useTxDialog();
defineProps({
  proposals: { type: Object as PropType<PaginatedProposals> },
});

const format = useFormatter();
const staking = useStakingStore();
const chain = useBlockchain();

function showType(v: string) {
  if (v) {
    return v.substring(v.lastIndexOf('.') + 1);
  }
  return v;
}

const statusMap: Record<string, string> = {
  PROPOSAL_STATUS_VOTING_PERIOD: 'VOTING',
  PROPOSAL_STATUS_PASSED: 'PASSED',
  PROPOSAL_STATUS_REJECTED: 'REJECTED',
};

const statusStyleMap: Record<string, { bg: string; text: string; icon: string }> = {
  VOTING: { bg: 'bg-info/10', text: 'text-info', icon: 'mdi:vote' },
  PASSED: { bg: 'bg-success/10', text: 'text-success', icon: 'mdi:check-circle' },
  REJECTED: { bg: 'bg-error/10', text: 'text-error', icon: 'mdi:close-circle' },
};

const voterStatusMap: Record<string, string> = {
  VOTE_OPTION_NO_WITH_VETO: '',
  VOTE_OPTION_YES: 'success',
  VOTE_OPTION_NO: 'error',
  VOTE_OPTION_ABSTAIN: 'warning',
};

const proposalInfo = ref();

function metaItem(metadata: string | undefined): { title: string; summary: string } {
  if (metadata) {
    const parsed = JSON.parse(metadata);
    return {
      title: parsed.title || '',
      summary: parsed.summary || '',
    };
  }
  return { title: '', summary: '' };
}

function getStatusStyle(status: string) {
  const mappedStatus = statusMap[status] || status;
  return statusStyleMap[mappedStatus] || statusStyleMap.VOTING;
}
</script>
<template>
  <div class="bg-base-100 rounded-xl border border-base-300/40 text-base-content text-sm overflow-hidden">
    <!-- Desktop Table View -->
    <table class="table-compact w-full table-fixed hidden lg:!table">
      <tbody class="divide-y divide-base-300/30">
        <tr 
          v-for="(item, index) in proposals?.proposals" 
          :key="index"
          class="hover:bg-base-200/50 transition-colors duration-150"
        >
          <!-- Proposal ID -->
          <td class="px-4 py-4 w-24">
            <label
              for="proposal-detail-modal"
              class="inline-flex items-center gap-1.5 text-primary hover:text-primary-focus cursor-pointer font-semibold text-sm bg-primary/10 px-2.5 py-1 rounded-lg transition-colors duration-150"
              @click="proposalInfo = item"
            >
              <Icon icon="mdi:file-document-outline" class="text-sm" />
              #{{ item?.proposal_id }}
            </label>
          </td>
          
          <!-- Title & Type -->
          <td class="py-4 w-full">
            <div>
              <RouterLink
                :to="`/${chain.chainName}/gov/${item?.proposal_id}`"
                class="text-base-content text-base mb-1.5 block hover:text-primary truncate font-semibold transition-colors duration-150"
              >
                {{ item?.content?.title || item?.title || metaItem(item?.metadata)?.title }}
              </RouterLink>
              <div
                v-if="item.content"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
              >
                <Icon icon="mdi:code-tags" class="text-xs" />
                {{ showType(item.content['@type']) }}
              </div>
            </div>
          </td>
          
          <!-- Progress -->
          <td class="w-64 px-2">
            <ProposalProcess :pool="staking.pool" :tally="item.final_tally_result"></ProposalProcess>
          </td>
          
          <!-- Status -->
          <td class="w-40 px-2">
            <div class="flex flex-col gap-1">
              <div
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold w-fit"
                :class="[getStatusStyle(item?.status).bg, getStatusStyle(item?.status).text]"
              >
                <Icon :icon="getStatusStyle(item?.status).icon" class="text-sm" />
                {{ statusMap?.[item?.status] || item?.status }}
              </div>
              <div class="text-xs text-base-content/50 flex items-center gap-1">
                <Icon icon="mdi:clock-outline" class="text-xs" />
                {{ format.toDay(item.voting_end_time, 'from') }}
              </div>
            </div>
          </td>

          <!-- Vote Button -->
          <td v-if="statusMap?.[item?.status] === 'VOTING'" class="w-32 px-4">
            <button
              class="btn btn-sm btn-primary gap-1.5 shadow-sm hover:shadow-md transition-all duration-150"
              @click="dialog.open('vote', { proposal_id: item?.proposal_id })"
            >
              <Icon icon="mdi:vote" class="text-base" />
              <span v-if="item?.voterStatus !== 'VOTE_OPTION_NO_WITH_VETO'">
                {{ item?.voterStatus?.replace('VOTE_OPTION_', '') }}
              </span>
              <span v-else>Vote</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Mobile Card View -->
    <div class="lg:!hidden divide-y divide-base-300/30">
      <div 
        v-for="(item, index) in proposals?.proposals" 
        :key="index" 
        class="p-4 hover:bg-base-200/30 transition-colors duration-150"
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-3 mb-3">
          <RouterLink 
            :to="`/${chain.chainName}/gov/${item?.proposal_id}`" 
            class="flex-1 min-w-0"
          >
            <h3 class="text-base font-semibold text-base-content hover:text-primary truncate transition-colors duration-150">
              {{ item?.content?.title || item?.title || metaItem(item?.metadata)?.title }}
            </h3>
          </RouterLink>
          <label
            for="proposal-detail-modal"
            class="flex-shrink-0 inline-flex items-center gap-1 text-primary hover:text-primary-focus cursor-pointer font-semibold text-sm bg-primary/10 px-2 py-1 rounded-lg"
            @click="proposalInfo = item"
          >
            #{{ item?.proposal_id }}
          </label>
        </div>

        <!-- Meta Info -->
        <div class="flex items-center gap-2 mb-3 flex-wrap">
          <div
            v-if="item.content"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
          >
            <Icon icon="mdi:code-tags" class="text-xs" />
            {{ showType(item.content['@type']) }}
          </div>
          <div class="text-xs text-base-content/50 flex items-center gap-1">
            <Icon icon="mdi:clock-outline" class="text-xs" />
            {{ format.toDay(item.voting_end_time, 'from') }}
          </div>
        </div>

        <!-- Progress -->
        <div class="mb-3">
          <ProposalProcess :pool="staking.pool" :tally="item.final_tally_result"></ProposalProcess>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between">
          <div
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
            :class="[getStatusStyle(item?.status).bg, getStatusStyle(item?.status).text]"
          >
            <Icon :icon="getStatusStyle(item?.status).icon" class="text-sm" />
            {{ statusMap?.[item?.status] || item?.status }}
          </div>
          
          <button
            v-if="statusMap?.[item?.status] === 'VOTING'"
            class="btn btn-sm btn-primary gap-1.5"
            @click="dialog.open('vote', { proposal_id: item?.proposal_id })"
          >
            <Icon icon="mdi:vote" class="text-base" />
            <span v-if="item?.voterStatus !== 'VOTE_OPTION_NO_WITH_VETO'">
              {{ item?.voterStatus?.replace('VOTE_OPTION_', '') }}
            </span>
            <span v-else>Vote</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <input type="checkbox" id="proposal-detail-modal" class="modal-toggle" />
    <label for="proposal-detail-modal" class="modal backdrop-blur-sm">
      <label class="modal-box !w-11/12 !max-w-5xl bg-base-100 rounded-2xl border border-base-300/50 shadow-strong" for="">
        <label 
          for="proposal-detail-modal" 
          class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 hover:bg-base-200"
        >
          <Icon icon="mdi:close" class="text-lg" />
        </label>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon icon="mdi:file-document-outline" class="text-xl text-primary" />
          </div>
          <h3 class="font-bold text-xl text-base-content">Description</h3>
        </div>
        <div class="prose prose-sm max-w-none">
          <Component
            v-if="proposalInfo?.content?.description || proposalInfo?.summary || metaItem(proposalInfo?.metadata)?.summary"
            :is="select(
              proposalInfo?.content?.description ||
              proposalInfo?.summary ||
              metaItem(proposalInfo?.metadata)?.summary,
              'horizontal'
            )"
            :value="proposalInfo?.content?.description || proposalInfo?.summary || metaItem(proposalInfo?.metadata)?.summary"
          />
        </div>
      </label>
    </label>
  </div>
</template>
