"use client";

import { useRef, useEffect } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "highlight.js/styles/atom-one-dark.css";
import "katex/dist/katex.min.css";

const toolbarOptions = [
  [{ font: [] }, { size: [] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  ["blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }, { align: [] }],
  ["link", "image", "video", "formula"],
  ["clean"],
];

interface EditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  isFullPage?: boolean;
}

export function Editor({ initialContent, onChange, isFullPage }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
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
        className={`w-full bg-white ${
          isFullPage ? "h-[calc(100dvh-4.4rem)]" : "h-[calc(80vh)]"
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
            margin: 0 auto;
            padding: 30px 60px;
            ${isFullPage ? "max-width: 850px;" : ""}
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
          .ql-editor .page-break {
            padding: 0;
            margin: 1rem 0;
            border-top: 1px dashed #ccc;
            page-break-after: always;
          }

          .ql-editor p {
            margin-bottom: 1em;
          }
        `}</style>
        <div ref={editorRef} className="h-full" />
      </div>
    </div>
  );
}
