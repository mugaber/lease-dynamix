export const runtime = "nodejs";

import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";

const SALT_ROUNDS = 10;

export async function POST(req: Request) {
  const { password, hashedPassword, action } = await req.json();

  if (action === "hash") {
    const hashed = await hash(password, SALT_ROUNDS);
    return NextResponse.json({ hashedPassword: hashed });
  }

  if (action === "compare") {
    const isValid = await compare(password, hashedPassword);
    return NextResponse.json({ isValid });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
