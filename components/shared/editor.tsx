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
  ["link", "image"],
  ["clean"],
  ["pageBreak"],
];

interface EditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export function Editor({ initialContent, onChange }: EditorProps) {
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
    <div className="w-full h-[calc(100dvh-6.8rem)]">
      <div className="w-full h-full bg-white">
        <style jsx global>{`
          .ql-container {
            border: none;
          }

          .ql-editor {
            width: 816px;
            height: 97% !important;
            margin: 1rem auto;
            padding: 60px !important;
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow-y: auto;
          }

          .ql-editor p {
            font-size: 16px;
          }

          .ql-toolbar {
            position: sticky;
            top: 0;
            z-index: 30;
            margin: 0 auto;
            border: none !important;
            border-bottom: 1px solid #e5e7eb !important;
            background: white;
            padding: 8px 15px !important;
          }

          .ql-container.ql-snow {
            background: #f0f3f4;
            height: 100%;
            overflow-y: auto;
          }

          .page-break {
            width: 816px;
            margin: 1rem auto;
            border-top: 1px dashed #ccc;
            position: relative;
          }

          /* Hide scrollbars */

          body,
          html {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
          }

          body::-webkit-scrollbar,
          html::-webkit-scrollbar {
            display: none;
          }

          .ql-container.ql-snow::-webkit-scrollbar {
            display: none;
          }

          .ql-container.ql-snow {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
          }

          .ql-editor::-webkit-scrollbar {
            display: none;
          }

          .ql-editor {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
          }
        `}</style>
        <div ref={editorRef} className="h-full overflow-hidden" />
      </div>
    </div>
  );
}
