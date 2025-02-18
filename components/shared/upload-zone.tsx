"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface UploadZoneProps {
  onUploadFiles: (files: File[]) => void;
}

export function UploadZone({ onUploadFiles }: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onUploadFiles(acceptedFiles);
    },
    [onUploadFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer h-full flex items-center justify-center
        ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <div>
          <p>Drag and drop files here, or click to select files</p>
          <p className="text-sm text-gray-500 mt-2">
            Supported files: PDF, DOC, DOCX, TXT
          </p>
        </div>
      )}
    </div>
  );
}
