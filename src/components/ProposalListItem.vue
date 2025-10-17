<script lang="ts" setup>
import { useBlockchain, useFormatter, useStakingStore, useTxDialog } from '@/stores';
import { select } from '@/components/dynamic/index';
import type { PaginatedProposals } from '@/types';
import ProposalProcess from './ProposalProcess.vue';
import type { PropType } from 'vue';
import { computed, ref } from 'vue';
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
const voterStatusMap: Record<string, string> = {
  VOTE_OPTION_NO_WITH_VETO: '',
  VOTE_OPTION_YES: 'success',
  VOTE_OPTION_NO: 'error',
  VOTE_OPTION_ABSTAIN: 'warning',
};

const proposalInfo = ref();

function metaItem(metadata: string | undefined): { title: string; summary: string } {
  if (metadata) {
    try {
      const parsed = JSON.parse(metadata);
      return {
        title: parsed.title || '',
        summary: parsed.summary || '',
      };
    } catch (e) {
      console.error('Failed to parse metadata:', e);
      return { title: '', summary: '' };
    }
  }
  return { title: '', summary: '' };
}
</script>
<template>
  <div class="card bg-base-100 shadow-lg rounded-box text-base-content text-sm">
    <div class="overflow-x-auto hidden lg:block">
      <table class="table w-full">
        <thead>
          <tr>
            <th class="w-20">#ID</th>
            <th>Title</th>
            <th class="w-60">Progress</th>
            <th class="w-36">Status</th>
            <th v-if="proposals?.proposals?.some(p => statusMap?.[p?.status] === 'VOTING')" class="w-40">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in proposals?.proposals" :key="index" class="hover:bg-base-200">
            <td class="px-4 py-3">
              <label
                for="proposal-detail-modal"
                class="link link-hover text-primary font-semibold"
                @click="proposalInfo = item"
              >
                #{{ item?.proposal_id }}</label
              >
            </td>
            <td class="py-3">
              <RouterLink
                :to="`/${chain.chainName}/gov/${item?.proposal_id}`"
                class="link link-hover text-base-content font-medium block truncate"
              >
                {{
                  item?.content?.title ||
                  item?.title ||
                  metaItem(item?.metadata)?.title
                }}
              </RouterLink>
              <div
                v-if="item.content"
                class="badge badge-outline badge-primary badge-sm mt-1"
              >
                {{ showType(item.content['@type']) }}
              </div>
            </td>
            <td class="py-3">
              <ProposalProcess :pool="staking.pool" :tally="item.final_tally_result"></ProposalProcess>
            </td>
            <td class="py-3">
              <div class="flex items-center gap-2">
                <span
                  class="badge badge-lg"
                  :class="{
                    'badge-success': statusMap?.[item?.status] === 'PASSED',
                    'badge-error': statusMap?.[item?.status] === 'REJECTED',
                    'badge-info': statusMap?.[item?.status] === 'VOTING',
                  }"
                >
                  {{ statusMap?.[item?.status] || item?.status }}
                </span>
                <span class="text-xs text-neutral-content">
                  {{ format.toDay(item.voting_end_time, 'from') }}
                </span>
              </div>
            </td>
            <td v-if="statusMap?.[item?.status] === 'VOTING'" class="py-3">
              <label
                for="vote"
                class="btn btn-sm btn-primary"
                @click="
                  dialog.open('vote', {
                    proposal_id: item?.proposal_id,
                  })
                "
              >
                <span v-if="item?.voterStatus !== 'VOTE_OPTION_NO_WITH_VETO'">{{
                  item?.voterStatus?.replace('VOTE_OPTION_', '')
                }}</span>
                <span v-else>Vote</span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile View -->
    <div class="lg:hidden p-4 space-y-4">
      <div v-for="(item, index) in proposals?.proposals" :key="index" class="card bg-base-200 shadow-md p-4">
        <div class="flex justify-between items-start mb-2">
          <RouterLink :to="`/${chain.chainName}/gov/${item?.proposal_id}`" class="text-base-content font-medium text-lg flex-1 truncate mr-4">
            {{ item?.content?.title || item?.title || metaItem(item?.metadata)?.title }}
          </RouterLink>
          <label
            for="proposal-detail-modal"
            class="link link-hover text-primary font-semibold"
            @click="proposalInfo = item"
          >
            #{{ item?.proposal_id }}</label
          >
        </div>

        <div class="flex flex-wrap items-center gap-2 mb-3">
          <div
            v-if="item.content"
            class="badge badge-outline badge-primary badge-sm"
          >
            {{ showType(item.content['@type']) }}
          </div>
          <span
            class="badge badge-lg"
            :class="{
              'badge-success': statusMap?.[item?.status] === 'PASSED',
              'badge-error': statusMap?.[item?.status] === 'REJECTED',
              'badge-info': statusMap?.[item?.status] === 'VOTING',
            }"
          >
            {{ statusMap?.[item?.status] || item?.status }}
          </span>
          <span class="text-xs text-neutral-content ml-auto">
            {{ format.toDay(item.voting_end_time, 'from') }}
          </span>
        </div>

        <div class="mb-4">
          <ProposalProcess :pool="staking.pool" :tally="item.final_tally_result"></ProposalProcess>
        </div>

        <div v-if="statusMap?.[item?.status] === 'VOTING'" class="text-right">
          <label
            for="vote"
            class="btn btn-sm btn-primary"
            @click="
              dialog.open('vote', {
                proposal_id: item?.proposal_id,
              })
            "
          >
            <span v-if="item?.voterStatus !== 'VOTE_OPTION_NO_WITH_VETO'">{{
              item?.voterStatus?.replace('VOTE_OPTION_', '')
            }}</span>
            <span v-else>Vote</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Proposal Detail Modal -->
    <input type="checkbox" id="proposal-detail-modal" class="modal-toggle" />
    <label for="proposal-detail-modal" class="modal cursor-pointer">
      <label class="modal-box relative !w-11/12 !max-w-3xl bg-base-100 shadow-xl rounded-box p-6" for="">
        <label for="proposal-detail-modal" class="btn btn-sm btn-circle absolute right-4 top-4">✕</label>
        <h3 class="font-bold text-2xl text-base-content mb-4">Proposal Description</h3>
        <div class="prose max-w-none text-base-content">
          <Component
            v-if="
              proposalInfo?.content?.description || proposalInfo?.summary || metaItem(proposalInfo?.metadata)?.summary
            "
            :is="
              select(
                proposalInfo?.content?.description ||
                  proposalInfo?.summary ||
                  metaItem(proposalInfo?.metadata)?.summary,
                'horizontal'
              )
            "
            :value="
              proposalInfo?.content?.description || proposalInfo?.summary || metaItem(proposalInfo?.metadata)?.summary
            "
          >
          </Component>
        </div>
      </label>
    </label>
  </div>
</template>
