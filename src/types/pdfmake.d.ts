declare module "pdfmake/build/pdfmake" {
  import type { TDocumentDefinitions } from "pdfmake/interfaces";

  export interface PdfMakeInstance {
    vfs: Record<string, string>;
    createPdf: (docDefinition: TDocumentDefinitions) => {
      download: (fileName?: string) => void;
      open: () => void;
      print: () => void;
    };
  }

  const pdfMake: PdfMakeInstance;
  export default pdfMake;
}

declare module "pdfmake/build/vfs_fonts" {
  const pdfFonts: {
    pdfMake: {
      vfs: Record<string, string>;
    };
  };

  export default pdfFonts;
}
