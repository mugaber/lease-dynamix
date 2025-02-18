"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadFileToStorage, saveFileMetadata } from "@/lib/services/files";
import { Editor } from "./editor";
import mammoth from "mammoth";
interface FileUploadProps {
  onUploadComplete?: () => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedContent, setUploadedContent] = useState<{
    content: string;
    path: string;
  }>({ content: "", path: "" });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true);
      try {
        const file = acceptedFiles[0];
        const uploadedFile = await uploadFileToStorage(file);
        await saveFileMetadata(uploadedFile);

        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setUploadedContent({ content: result.value, path: uploadedFile.path });

        toast.success("Files uploaded successfully");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload files");
      } finally {
        setIsUploading(false);
        onUploadComplete?.();
      }
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
    maxSize: 10 * 1024 * 1024,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
  });

  if (uploadedContent.content) {
    return (
      <Editor
        initialContent={uploadedContent.content}
        onChange={(content) => console.log("Content changed:", content)}
      />
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8
        flex flex-col items-center justify-center h-full
        ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300"}
        ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Uploading files...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-gray-500" />
          <p>Drag & drop files here, or click to select files</p>
          <p className="text-sm text-muted-foreground">
            Supported files: PDF, DOC, DOCX, TXT
          </p>
        </div>
      )}
    </div>
  );
}
