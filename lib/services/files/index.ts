import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface UploadedFile {
  name: string;
  size: number;
  url: string;
  path: string;
}

export async function uploadFileToStorage(file: File): Promise<UploadedFile> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2, 20)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("files")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("files").getPublicUrl(filePath);

  return {
    name: file.name,
    size: file.size,
    url: publicUrl,
    path: filePath,
  };
}

export async function saveFileMetadata(file: UploadedFile): Promise<void> {
  const response = await fetch("/api/files", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(file),
  });

  if (!response.ok) {
    throw new Error("Failed to save file metadata");
  }
}

export async function deleteFileFromStorage(filePath: string): Promise<void> {
  const { error } = await supabase.storage.from("files").remove([filePath]);

  if (error) {
    throw error;
  }
}

export async function getFile(filePath: string): Promise<Blob | null> {
  const { data, error } = await supabase.storage
    .from("files")
    .download(filePath);

  if (error) {
    console.error("Error downloading file:", error);
    return null;
  }

  return data;
}
