declare module "html-to-docx" {
  interface Options {
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    font?: string;
    title?: string;
    header?: boolean;
    footer?: boolean;
    pageNumber?: boolean;
  }

  function HTMLtoDOCX(
    html: string,
    headerHtml: string | null,
    options?: Options
  ): Promise<Blob>;

  export default HTMLtoDOCX;
}
