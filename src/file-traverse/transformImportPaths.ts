import { ExportNode, ImportNode } from "../types";
import { getAbsolutePath } from "./getAbsolutePath";

function removeFileExtension(file: string) {
  for (let i = file.length - 1; i >= 1; i--) {
    const c = file[i];
    if (c === "/") {
      return file;
    }
    if (c === ".") {
      return file.slice(0, i);
    }
  }
  return file;
}

export function transformImportPaths(
  im: ImportNode,
  folders: Set<string>
): ImportNode {
  im = { ...im };
  im.file = removeFileExtension(im.file);
  let importPath = getAbsolutePath(im.file, im.source);
  if (folders.has(importPath)) {
    importPath += "/index";
  }
  im.source = removeFileExtension(importPath);
  return im;
}

export function transformExportPaths(
  ex: ExportNode,
  folders: Set<string>
): ExportNode {
  ex = { ...ex };
  ex.file = removeFileExtension(ex.file);
  if (ex.type === "NewExport") {
    return ex;
  }
  let importPath = getAbsolutePath(ex.file, ex.source);
  if (folders.has(importPath)) {
    importPath += "/index";
  }
  ex.source = removeFileExtension(importPath);
  return ex;
}
