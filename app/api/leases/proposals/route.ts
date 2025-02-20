import { NextRequest, NextResponse } from "next/server";
import {
  checkLeaseProposal,
  deleteLeaseProposal,
  updateLeaseProposalTerm,
} from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const proposalId = searchParams.get("proposalId");

  if (!proposalId) {
    return NextResponse.json(
      { error: "Proposal ID is required" },
      { status: 400 }
    );
  }

  const proposal = await checkLeaseProposal(proposalId);

  return NextResponse.json(proposal);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const proposalId = searchParams.get("proposalId");

  if (!proposalId) {
    return NextResponse.json(
      { error: "Proposal ID is required" },
      { status: 400 }
    );
  }

  await deleteLeaseProposal(proposalId);

  return NextResponse.json({ message: "Proposal deleted" }, { status: 200 });
}

export async function PATCH(request: NextRequest) {
  const { proposalId, termId, value, valueStr, strikethrough } =
    await request.json();

  if (!proposalId || !termId || !value || !valueStr || !strikethrough) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const updated = await updateLeaseProposalTerm({
    proposalId,
    termId,
    value,
    valueStr,
    strikethrough,
  });
  return NextResponse.json(updated);
}
