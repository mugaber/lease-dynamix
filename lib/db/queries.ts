import { desc, and, eq, isNull } from "drizzle-orm";
import { db } from "./drizzle";
import {
  activityLogs,
  files,
  LeaseProposal,
  leaseProposals,
  teamMembers,
  teams,
  users,
} from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session";
import { leaseProposal } from "../data/lease-proposal";
import { Term } from "../types/lease-proposals";

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser(userId: number) {
  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      teamMembers: {
        with: {
          team: {
            with: {
              teamMembers: {
                with: {
                  user: {
                    columns: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return result?.teamMembers[0]?.team || null;
}

export const createFile = async (fileData: {
  name: string;
  size: number;
  url: string;
  path: string;
  userId: number;
}) => {
  const result = await db
    .insert(files)
    .values({
      ...fileData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result[0];
};

export async function getFilesByUserId(userId: number) {
  const result = await db.select().from(files).where(eq(files.userId, userId));

  return result;
}

export async function deleteFile(fileId: number) {
  await db.delete(files).where(eq(files.id, fileId));
}

// Lease Proposal Queries

export async function createLeaseProposal(data: LeaseProposal) {
  return await db.insert(leaseProposals).values({
    proposalId: data.proposalId,
    terms: data.terms,
  });
}

export async function getLeaseProposal(id: string) {
  return await db.query.leaseProposals.findFirst({
    where: (proposals, { eq }) => eq(proposals.proposalId, id),
  });
}

export async function checkLeaseProposal(id: string) {
  const proposal = await getLeaseProposal(id);
  if (!proposal) {
    return await db.insert(leaseProposals).values({
      proposalId: id,
      terms: leaseProposal.terms,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return proposal;
}

export async function deleteLeaseProposal(id: string) {
  await db.delete(leaseProposals).where(eq(leaseProposals.proposalId, id));
}

export async function updateLeaseProposalTerm({
  proposalId,
  termId,
  value,
  valueStr,
  strikethrough,
}: {
  proposalId: string;
  termId: string;
  value: number;
  valueStr: string;
  strikethrough: string;
}) {
  const proposal = await getLeaseProposal(proposalId);
  if (!proposal) return null;

  const updatedTerms = (proposal.terms as Term[]).map((term: Term) =>
    term.id === termId
      ? {
          ...term,
          value,
          document_edit: {
            search_text: term.document_edit.search_text.replace(
              strikethrough,
              `${strikethrough} ${valueStr}`
            ),
            strikethrough,
          },
        }
      : term
  );

  return await db
    .update(leaseProposals)
    .set({
      terms: updatedTerms,
      updatedAt: new Date(),
    })
    .where(eq(leaseProposals.proposalId, proposalId))
    .returning();
}
