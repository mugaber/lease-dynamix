export const leaseProposal = {
  proposal_id: "001",
  terms: [
    {
      id: "base_rent",
      name: "Base Rent",
      value: 40.5,
      unit: "USD/sqft/year",
      updated_value: null,
      comparables: [39.0, 40.0, 40.5, 41.0, 42.0],
      metadata: { category: "Financial", parent: null },
      document_edit: {
        search_text:
          "The tenant shall pay a base rent of $40.5 per square foot per year.",
        strikethrough: "$40.5",
      },
    },
    {
      id: "lease_term",
      name: "Lease Term",
      value: 5,
      unit: "years",
      updated_value: null,
      comparables: [3, 5, 5, 5, 7, 7, 10],
      metadata: { category: "Duration", parent: null },
      document_edit: {
        search_text:
          "The lease term shall be for a period of 5 years commencing on January 1, 2025.",
        strikethrough: "5",
      },
    },
    {
      id: "renewal_term",
      name: "Renewal Term",
      value: 5,
      unit: "years",
      updated_value: null,
      comparables: [1, 3, 3, 5, 5, 5, 7],
      metadata: { category: "Duration", parent: "lease_term" },
      document_edit: {
        search_text:
          "The tenant shall have the option to renew the lease for an additional term of 5 years upon written notice.",
        strikethrough: "5",
      },
    },
  ],
};
