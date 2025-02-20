import { Delta } from "quill";

declare module "quill-to-word" {
  interface ExportConfig {
    exportAs?: "blob" | "base64" | "buffer";
  }

  function generateWord(delta: Delta, config?: ExportConfig): Promise<Blob>;

  export { generateWord };
}
