"use client";

import { getFile } from "@/lib/services/files";
import { Loader2 } from "lucide-react";
import mammoth from "mammoth";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const Editor = dynamic(
  () => import("@/components/shared/editor").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex w-full h-full items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    ),
  }
);

function EditorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filePath = searchParams.get("filePath") || "";

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filePath) return;

    const fetchFileContent = async () => {
      setLoading(true);
      try {
        const contentBlob = await getFile(filePath);
        if (contentBlob) {
          const result = await mammoth.convertToHtml({
            arrayBuffer: await contentBlob.arrayBuffer(),
          });

          setContent(result.value);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Error fetching file content:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchFileContent();
  }, [filePath]);

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!filePath) {
    router.push("/dashboard");
    return;
  }

  if (!content) {
    return (
      <div className="flex w-full h-[calc(100dvh-4.4rem)] items-center justify-center p-8 flex-col gap-4">
        <h1 className="text-2xl font-bold">No content found</h1>
        {error && <p>{error}</p>}
      </div>
    );
  }

  return (
    <Editor
      initialContent={content}
      onChange={(content) => console.log(content)}
      isFullPage
    />
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full h-full items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <EditorPageContent />
    </Suspense>
  );
}
