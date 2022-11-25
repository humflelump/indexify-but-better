import { ExportNode, ImportNode } from "../types";
import { getAbsolutePath } from "./getAbsolutePath";
import { removeFileExtension } from "./removeFileExtension";

export function transformImportPaths(
  im: ImportNode,
  folders: Set<string>
): ImportNode {
  im = { ...im };
  im.fileWithExtension = im.file;
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
  ex.fileWithExtension = ex.file;
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
