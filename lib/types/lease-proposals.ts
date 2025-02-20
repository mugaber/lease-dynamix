export interface LeaseProposal {
  proposal_id: string;
  proposalId?: string;
  terms: Term[];
}

export interface Term {
  id: string;
  name: string;
  value: number;
  unit: string;
  updated_value: number | null;
  comparables: number[];
  metadata: { category: string; parent: string | null };
  document_edit: {
    search_text: string;
    strikethrough: string;
  };
}
