"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Quill, { Delta } from "quill";
import "quill/dist/quill.snow.css";
import "highlight.js/styles/atom-one-dark.css";
import "katex/dist/katex.min.css";
import { LeaseProposal } from "@/lib/types/lease-proposals";
import { getTermValue } from "@/lib/utils";
import { Popover, PopoverContent } from "@radix-ui/react-popover";
import { Input } from "../ui/input";
import { popoverStyles } from "./styles";
import { Button } from "../ui/button";
// import { toast } from "sonner";

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
];

interface EditorProps {
  initialContent: string;
  onChange: (content: Delta) => void;
  leaseProposal: LeaseProposal;
}

export function Editor({
  initialContent,
  onChange,
  leaseProposal,
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const [newValue, setNewValue] = useState<number | null>(null);

  const formatTerms = useCallback(() => {
    if (!quillRef.current) return;

    leaseProposal.terms.forEach((term) => {
      if (!quillRef.current) return;
      const text = quillRef.current.getText();

      const nameIndex = text.indexOf(term.name);
      if (nameIndex === -1) return;

      quillRef.current.formatText(nameIndex, term.name.length, {
        bold: true,
      });

      // const searchTextIndex = text.indexOf(term.document_edit.search_text);
      const normalizedSearchText = term.document_edit.search_text
        .replace(/\s+/g, " ")
        .replace(/\$(\d+)\.(\d)(?!\d)/g, "$$$1.$20")
        .trim();

      const normalizedText = text.replace(/\s+/g, " ").trim();

      const searchTextIndex = normalizedText.indexOf(normalizedSearchText);

      console.log({
        searchText: term.document_edit.search_text,
        fullText: text,
        term,
        searchTextIndex,
        normalizedSearchText,
        normalizedText,
      });

      if (searchTextIndex === -1) return;

      // TODO: Add strikethrough on initial load
      // if (term.document_edit.strikethrough) {
      //   const strikethroughIndex = text.indexOf(
      //     term.document_edit.strikethrough
      //   );
      //   console.log("Strikethrough index:", strikethroughIndex);
      //   if (strikethroughIndex !== -1) {
      //     quillRef.current.formatText(
      //       strikethroughIndex,
      //       term.document_edit.strikethrough.length,
      //       {
      //         strike: true,
      //         color: "red",
      //       }
      //     );
      //   }
      // }

      // const valueStr = getTermValue(term.value, term.unit);
      // const valueInSearchText = text.indexOf(valueStr);
      // console.log("Value index:", valueInSearchText);
      // if (valueInSearchText !== -1) {
      //   quillRef.current.formatText(valueInSearchText, valueStr.length, {
      //     color: "red",
      //     term: term.id,
      //   });
      // }

      const valueStr = getTermValue(term.value, term.unit);
      const valueInSearchText = text.indexOf(valueStr, searchTextIndex);
      if (valueInSearchText === -1) return;

      quillRef.current.formatText(valueInSearchText, valueStr.length, {
        color: "red",
        term: term.id,
      });
    });
  }, [leaseProposal]);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      const Inline = Quill.import("blots/inline") as {
        new (): HTMLElement;
        prototype: HTMLElement;
        create(value?: string): HTMLElement;
      };

      class TermBlot extends Inline {
        static blotName = "term";
        static tagName = "span";
        static scope = Quill.import("parchment").Scope.INLINE;

        static create(value: string) {
          const node = super.create() as HTMLElement;
          node.setAttribute("data-term-id", value);
          node.classList.add("term-value");
          node.style.color = "red";
          node.style.cursor = "pointer";
          return node;
        }
      }
      Quill.register("formats/term", TermBlot);

      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: toolbarOptions,
        },
      });

      quillRef.current.root.innerHTML = initialContent;

      quillRef.current.root.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("term-value")) {
          const termId = target.getAttribute("data-term-id");
          console.log({ termId });
          if (!termId) return;

          setSelectedTermId(termId);
          setPosition({ top: e.clientY, left: e.clientX });
          setIsPopoverOpen(true);
        }
      });

      setTimeout(() => {
        formatTerms();
      }, 0);

      quillRef.current.on("text-change", () => {
        onChange(quillRef.current?.getContents() as Delta);
      });
    }
  }, [onChange, initialContent, formatTerms]);

  return (
    <div className="w-full h-[calc(100dvh-6.8rem)]">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverContent
          className={popoverStyles}
          side="right"
          style={{
            position: "absolute",
            top: position.top + 12,
            left: position.left,
            zIndex: 50,
          }}
        >
          <div className="space-y-3">
            <h4 className="font-medium leading-none tracking-tight">
              Edit{" "}
              {leaseProposal.terms.find((t) => t.id === selectedTermId)?.name}{" "}
              Value
            </h4>
            <Input
              type="text"
              placeholder="Enter new value"
              className="w-full"
              onChange={async (e) => {
                const term = leaseProposal.terms.find(
                  (t) => t.id === selectedTermId
                );
                if (!term) return;

                setNewValue(parseFloat(e.target.value));
              }}
            />
            <Button
              variant="outline"
              className="w-full cursor-pointer"
              onClick={async (e) => {
                if (!quillRef.current || !selectedTermId) return;

                e.stopPropagation();

                const text = quillRef.current.getText();
                const term = leaseProposal.terms.find(
                  (t) => t.id === selectedTermId
                );

                if (!term || !term.value || !term.unit || !newValue) return;

                const newValueStr = getTermValue(newValue ?? 0, term.unit);
                const strikethrough = getTermValue(term.value, term.unit);

                const searchTextIndex = text.indexOf(
                  term.document_edit.search_text
                );
                if (searchTextIndex === -1) return;

                const valueInSearchText = text.indexOf(
                  strikethrough,
                  searchTextIndex
                );
                if (valueInSearchText === -1) return;

                console.log({
                  valueInSearchText,
                  searchTextIndex,
                  strikethrough,
                  term,
                  quillRef,
                  text,
                  value: newValue,
                  newValueStr,
                  leaseProposal,
                });

                quillRef.current.formatText(
                  valueInSearchText,
                  strikethrough.length,
                  {
                    strike: true,
                    color: "red",
                  }
                );

                quillRef.current.insertText(
                  valueInSearchText + strikethrough.length,
                  ` ${newValueStr}`,
                  {
                    term: term.id,
                    color: "red",
                  }
                );

                // Todo: Update lease proposal in db
                // try {
                //   await fetch("/api/leases/proposals", {
                //     method: "PATCH",
                //     body: JSON.stringify({
                //       proposalId: leaseProposal.proposalId,
                //       termId: term.id,
                //       value: newValue,
                //       valueStr: newValueStr,
                //       strikethrough,
                //     }),
                //   });
                // } catch (error) {
                //   toast.error("Failed to save proposal updates");
                //   console.error(error);
                // }

                setIsPopoverOpen(false);
              }}
            >
              Save
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-full h-full bg-white">
        <style jsx global>{`
          .ql-container {
            border: none;
          }

          .ql-editor {
            width: 816px;
            height: 1080px !important;
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
            display: flex;
            justify-content: center;
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

          .term-value {
            cursor: pointer !important;
            user-select: none !important;
          }
          .term-value:hover {
            text-decoration: underline;
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
