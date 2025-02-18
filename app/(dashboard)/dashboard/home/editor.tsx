import { useRef, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

// TODO: Make the UI nicer
// TODO: Save the changes to the file and Add a Save button
// TODO: Open a dedicated page for the editor

export function Editor({ initialContent, onChange }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      const toolbarOptions = [
        [{ header: [1, 2, 3, false] }],
        [{ font: [] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image", "code-block"],
        ["clean"],
      ];

      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: toolbarOptions,
        },
      });

      quillRef.current.on("text-change", () => {
        onChange(quillRef.current?.root.innerHTML || "");
      });

      quillRef.current.root.innerHTML = initialContent;
    }
  }, [onChange, initialContent]);

  return (
    <div className="w-full">
      <div
        className={`${
          isFullScreen
            ? "fixed inset-0 z-50 bg-white"
            : "relative w-full h-[calc(100vh-4rem)] bg-white"
        }`}
      >
        <style jsx global>{`
          .ql-toolbar {
            position: sticky;
            top: 0;
            z-index: 30;
            background: white;
            border: none;
            border-bottom: 1px solid #e5e7eb;
            padding: 8px 16px;
            display: flex;
            justify-content: center;
          }
          .ql-toolbar .ql-formats {
            margin-right: 15px;
          }
          .ql-toolbar button {
            width: 28px;
            height: 28px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          .ql-toolbar button:hover {
            color: #000;
          }
          .ql-toolbar .ql-active {
            color: #0066ff;
          }
          .ql-container {
            border: none;
            font-size: 16px;
            height: calc(100% - 65px);
          }
          .ql-editor {
            height: 100%;
            padding: 24px;
          }
          .ql-picker {
            height: 28px;
          }
          .ql-picker-label {
            padding: 0 8px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
          }
          .ql-picker-options {
            border-radius: 4px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        `}</style>
        <div className="absolute right-4 top-2 z-40">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer relative bottom-1"
            onClick={() => setIsFullScreen(!isFullScreen)}
          >
            {isFullScreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div ref={editorRef} className="h-full" />
      </div>
    </div>
  );
}
