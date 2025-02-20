"use client";

import { getFile, updateFile } from "@/lib/services/files";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { renderAsync } from "docx-preview";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Delta } from "quill";
import { LeaseProposal } from "@/lib/types/lease-proposals";

async function getQuillToWord() {
  if (typeof window === "undefined") return null;
  return await import("quill-to-word");
}

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
  const [newContent, setNewContent] = useState<Delta>();
  const [proposal, setProposal] = useState<LeaseProposal | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposal = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/leases/proposals?proposalId=001`);
        const data = await response.json();
        console.log(data);
        setProposal(data as LeaseProposal);
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, []);

  useEffect(() => {
    if (!filePath) return;

    const fetchFileContent = async () => {
      setLoading(true);
      try {
        const contentBlob = await getFile(filePath);
        if (!contentBlob) return;

        const tempDiv = document.createElement("div");

        await renderAsync(await contentBlob.arrayBuffer(), tempDiv, undefined, {
          inWrapper: false,
          ignoreWidth: true,
          ignoreHeight: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
        });

        const pages = Array.from(tempDiv.querySelectorAll("section.docx"));
        const processedContent = pages
          .map((page) => {
            const paragraphs = Array.from(page.querySelectorAll("article p"))
              .map((p) => p.innerHTML)
              .join("</p><p>");
            return `<p>${paragraphs}</p>`;
          })
          .join('<p class="page-break"><br></p>');

        const cleanedContent = processedContent
          .replace(/<span>/g, "")
          .replace(/<\/span>/g, "")
          .replace(/<p><\/p>/g, "<p><br></p>")
          .replace(/(<br>){3,}/g, "<br><br>");

        setContent(cleanedContent);
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

  const saveFileChanges = useCallback(async () => {
    setIsSaving(true);
    try {
      if (!newContent) return;

      const quillToWord = await getQuillToWord();
      if (!quillToWord) return;

      const docxBuffer = (await quillToWord.generateWord(newContent, {
        exportAs: "buffer" as const,
      })) as Buffer;

      await updateFile(filePath, docxBuffer);
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setIsSaving(false);
    }
  }, [newContent, filePath]);

  useEffect(() => {
    if (!newContent) return;
    const timeoutId = setTimeout(saveFileChanges, 5000);
    return () => clearTimeout(timeoutId);
  }, [saveFileChanges, newContent]);

  const downloadFile = async () => {
    try {
      if (!newContent) return;

      const quillToWord = await getQuillToWord();
      if (!quillToWord) return;

      const docxBlob = (await quillToWord.generateWord(newContent, {
        exportAs: "blob" as const,
      })) as Blob;

      const file = new File(
        [docxBlob],
        `${filePath.split("/").pop() || "document"}.docx`,
        {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }
      );

      const url = window.URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filePath.split("/").pop() || "document"}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  if (loading || !proposal) {
    return (
      <div className="flex w-full h-[100dvh] items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!filePath) {
    router.push("/dashboard/home");
    return;
  }

  if (!content && !loading) {
    return (
      <div className="flex w-full h-[calc(100dvh-4.4rem)] items-center justify-center p-8 flex-col gap-4">
        <h1 className="text-2xl font-bold">No content found</h1>
        {error && <p>{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh]">
      <header className="flex items-center px-4 py-1 border-b gap-2">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/dashboard/home")}
              className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex flex-col">
              <input
                type="text"
                value={filePath.split("/").pop() || "Untitled document"}
                className={`font-medium text-lg bg-transparent border-b border-transparent 
                  hover:border-gray-300 focus:border-gray-400 focus:outline-none px-1 w-fit`}
                readOnly
              />
              <div className="flex gap-3 text-sm">
                <button className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
                  File
                </button>
                <button className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
                  Edit
                </button>
                <button className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
                  View
                </button>
                <button className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
                  Insert
                </button>
                <button className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
                  Format
                </button>
                <button className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
                  Tools
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadFile}
            className="bg-green-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={saveFileChanges}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save"}
          </button>
        </div>
      </header>
      <div className="relative flex-1">
        <Editor
          initialContent={content}
          onChange={(content) => setNewContent(content)}
          leaseProposal={proposal as LeaseProposal}
        />
      </div>
    </div>
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
