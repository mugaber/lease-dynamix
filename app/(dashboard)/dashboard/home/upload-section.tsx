"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { FilesList } from "./files-list";
import { FileUpload } from "./file-upload";

export function UploadSection() {
  const [isUploadZoneVisible, setIsUploadZoneVisible] = useState(false);

  // onUploadComplete={() => setIsUploadZoneVisible(false)}

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-medium">Dashboard</h1>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => setIsUploadZoneVisible(!isUploadZoneVisible)}
        >
          {isUploadZoneVisible ? "Cancel Upload" : "Upload New File"}
        </Button>
      </div>

      {isUploadZoneVisible && (
        <div className="upload-zone-container mt-16 h-56">
          <FileUpload />
        </div>
      )}

      {!isUploadZoneVisible && (
        <Suspense fallback={<div>Loading files...</div>}>
          <FilesList />
        </Suspense>
      )}
    </>
  );
}
