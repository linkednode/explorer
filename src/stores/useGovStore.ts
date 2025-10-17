import { defineStore } from 'pinia';
import { useBlockchain } from './useBlockchain';
import type { PageRequest, PaginatedProposals, GovParams, Tally } from '@/types';
import { LoadingStatus } from './useDashboard';
import { useWalletStore } from './useWalletStore';
import { reactive } from 'vue';

export const useGovStore = defineStore('govStore', {
  state: () => {
    return {
      params: {
        deposit: {} as GovParams['deposit_params'],
        voting: {},
        tally: {},
      },
      proposals: {} as Record<string, PaginatedProposals>,
      loading: {} as Record<string, LoadingStatus>,
    };
  },
  getters: {
    blockchain() {
      return useBlockchain();
    },
    walletstore() {
      return useWalletStore();
    },
  },
  actions: {
    initial() {
      this.$reset();
      this.fetchParams();
      this.fetchProposals('2');
    },
    async fetchProposals(status: string, pagination?: PageRequest) {
      this.loading[status] = LoadingStatus.Loading;
      let proposals: PaginatedProposals = { proposals: [], pagination: {} };
      try {
        if (!this.blockchain.rpc) {
          console.warn('Blockchain RPC client not initialized. Cannot fetch governance proposals.');
          this.loading[status] = LoadingStatus.Loaded; // Ensure loading state is cleared
          return proposals;
        }
        const fetchedProposals = await this.blockchain.rpc.getGovProposals(status, pagination);
        console.log(`Fetched proposals for status ${status}:`, fetchedProposals); // Debugging log
        if (fetchedProposals) {
          proposals = reactive(fetchedProposals);
        }
      } catch (error) {
        console.error(`Error fetching proposals for status ${status}:`, error);
      } finally {
        //filter spam proposals
        if (proposals?.proposals) {
          proposals.proposals = proposals.proposals.filter((item) => {
            const title = item.content?.title || item.title || '';
            return title.toLowerCase().indexOf('airdrop') === -1;
          });
        }

        if (status === '2') {
          proposals?.proposals?.forEach((item) => {
            this.fetchTally(item.proposal_id).then((res) => {
              item.final_tally_result = res?.tally || { yes: '0', abstain: '0', no: '0', no_with_veto: '0' }; // Provide default Tally
            });
            if (this.walletstore.currentAddress) {
              try {
                this.fetchProposalVotesVoter(item.proposal_id, this.walletstore.currentAddress)
                  .then((res) => {
                    item.voterStatus = res?.vote?.option || 'VOTE_OPTION_NO_WITH_VETO';
                    // 'No With Veto';
                  })
                  .catch((reject) => {
                    item.voterStatus = 'VOTE_OPTION_NO_WITH_VETO';
                  });
              } catch (error) {
                item.voterStatus = 'VOTE_OPTION_NO_WITH_VETO';
              }
            } else {
              item.voterStatus = 'VOTE_OPTION_NO_WITH_VETO';
            }
          });
        }

        this.loading[status] = LoadingStatus.Loaded;
        this.proposals[status] = proposals;
      }
      return this.proposals[status];
    },
    async fetchParams() {
      if (!this.blockchain.rpc) {
        console.warn('Blockchain RPC client not initialized. Cannot fetch governance parameters.');
        return;
      }
      this.blockchain.rpc.getGovParamsDeposit().then(x => {
          this.params.deposit = x.deposit_params
      })
    },
    async fetchTally(proposalId: string) {
      if (!this.blockchain.rpc) {
        console.warn('Blockchain RPC client not initialized. Cannot fetch tally.');
        return;
      }
      return await this.blockchain.rpc.getGovProposalTally(proposalId);
    },
    async fetchProposal(proposalId: string) {
      if (!this.blockchain.rpc) {
        console.warn('Blockchain RPC client not initialized. Cannot fetch proposal.');
        return;
      }
      return this.blockchain.rpc.getGovProposal(proposalId);
    },
    async fetchProposalDeposits(proposalId: string) {
      if (!this.blockchain.rpc) {
        console.warn('Blockchain RPC client not initialized. Cannot fetch proposal deposits.');
        return;
      }
      return this.blockchain.rpc.getGovProposalDeposits(proposalId);
    },
    async fetchProposalVotes(proposalId: string, page?: PageRequest) {
      if (!this.blockchain.rpc) {
        console.warn('Blockchain RPC client not initialized. Cannot fetch proposal votes.');
        return;
      }
      return this.blockchain.rpc.getGovProposalVotes(proposalId, page);
    },
    async fetchProposalVotesVoter(proposalId: string, voter: string) {
      if (!this.blockchain.rpc) {
        console.warn('Blockchain RPC client not initialized. Cannot fetch proposal voter votes.');
        return;
      }
      return this.blockchain.rpc.getGovProposalVotesVoter(proposalId, voter);
    },
  },
});
