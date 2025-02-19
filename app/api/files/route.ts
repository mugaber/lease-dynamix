import { NextResponse } from "next/server";
import {
  createFile,
  deleteFile,
  getFilesByUserId,
  getUser,
} from "@/lib/db/queries";
import { z } from "zod";
import { deleteFileFromStorage } from "@/lib/services/files";

const fileSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  size: z.number(),
  url: z.string().url(),
  path: z.string(),
});

export async function GET() {
  const user = await getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const files = await getFilesByUserId(user.id);

  return NextResponse.json(files);
}

export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = fileSchema.parse(body);

    const file = await createFile({
      ...validatedData,
      userId: user.id,
    });

    return NextResponse.json(file);
  } catch (error) {
    console.error("Error creating file:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid file data", { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();

  await deleteFileFromStorage(body.path);
  await deleteFile(body.id);

  return NextResponse.json({ message: "File deleted" });
}
