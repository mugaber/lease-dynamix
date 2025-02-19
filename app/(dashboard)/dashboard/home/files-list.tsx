"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Trash2, File, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
interface FileItem {
  id: string;
  name: string;
  size: number;
  createdAt: Date;
  path: string;
}

export function FilesList() {
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/files");
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filePath: string, id: string) => {
    setDeleting(filePath);
    try {
      await fetch(`/api/files`, {
        method: "DELETE",
        body: JSON.stringify({ path: filePath, id }),
      });
      setFiles(files.filter((file) => file.id !== id));
      toast.success("File deleted successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error deleting file";
      console.error("Error deleting file:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  const handleEditFullPage = async (filePath: string) => {
    router.push(`/editor?filePath=${filePath}`);
  };

  const formatFileSize = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 text-muted-foreground">
        <div className="flex flex-col items-center justify-center gap-2">
          <File className="h-10 w-10" />
          <p>No files uploaded yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>{file.name}</TableCell>
              <TableCell>{formatFileSize(file.size)}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(file.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => handleEditFullPage(file.path)}
                  >
                    <ArrowUpRight className="h-4 w-4 hover:text-blue-500" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => handleDelete(file.path, file.id)}
                    disabled={!!deleting}
                  >
                    {deleting === file.path ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive hover:text-red-600" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
