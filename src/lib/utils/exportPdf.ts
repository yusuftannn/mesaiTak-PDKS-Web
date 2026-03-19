  type VfsType = Record<string, string>;

  function extractVfs(module: unknown): VfsType {
    if (typeof module === "object" && module !== null && "default" in module) {
      const def = (module as { default: unknown }).default;

      if (typeof def === "object" && def !== null && "pdfMake" in def) {
        const pdfMakeObj = (def as { pdfMake: unknown }).pdfMake;

        if (
          typeof pdfMakeObj === "object" &&
          pdfMakeObj !== null &&
          "vfs" in pdfMakeObj
        ) {
          return (pdfMakeObj as { vfs: VfsType }).vfs;
        }
      }

      if (typeof def === "object" && def !== null) {
        return def as VfsType;
      }
    }

    throw new Error("VFS yapısı çözümlenemedi");
  }

  export const loadPdfMake = async () => {
    const pdfMakeModule = await import("pdfmake/build/pdfmake");
    const pdfFontsModule = await import("pdfmake/build/vfs_fonts");

    const pdfMakeInstance = pdfMakeModule.default;

    const vfs = extractVfs(pdfFontsModule);

    pdfMakeInstance.vfs = vfs;

    return pdfMakeInstance;
  };

  