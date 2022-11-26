import { groupBy, uniq } from "lodash";
import { createNewFile } from "../file-helpers/createNewFile";
import { folderForClickedIndexFile } from "../file-helpers/folderForClickedIndexFile";
import { getIndexFilesInFolder } from "../file-helpers/getIndexFilesInFolder";
import { isFolderMostlyJsFiles } from "../file-helpers/isFolderMostlyJsFiles";
import { readFileContents } from "../file-helpers/readFileContents";
import { writeToFile } from "../file-helpers/writeToFile";
import { createGraph } from "../graph/createGraph";
import { createIndexFileInfo } from "../graph/createIndexFileInfo";
import {
  createCodeForExports,
  performImportEditsOnFile,
} from "../parser/performImportEditsOnFile";
import { deleteIndexFile } from "./deleteIndexFile";

export function createIndexFile(
  workspaceDirectory: string,
  selectedDirectory: string,
  useFs = false
): string {
  const folderOrNull = folderForClickedIndexFile(selectedDirectory);
  if (folderOrNull === null) {
    throw Error("Must click a directory or index file.");
  }
  selectedDirectory = folderOrNull;
  const graph = createGraph(workspaceDirectory);
  const indexFiles = getIndexFilesInFolder(selectedDirectory);
  if (indexFiles.length > 1) {
    throw Error(`Multiple index files found: ${indexFiles.join(", ")}`);
  }
  if (indexFiles.length === 1) {
    deleteIndexFile(workspaceDirectory, selectedDirectory, true);
    return createIndexFile(workspaceDirectory, selectedDirectory, true);
  }
  const info = createIndexFileInfo(graph, selectedDirectory);

  const groupedExportEdits = groupBy(
    info.exportTransform,
    (d) => d.original.fileWithExtension
  );
  const groupedImportEdits = groupBy(
    info.importTransforms,
    (d) => d.original.fileWithExtension
  );
  const filesToEdit = uniq([
    ...info.exportTransform.map((d) => d.original.fileWithExtension),
    ...info.importTransforms.map((d) => d.original.fileWithExtension),
  ]) as string[];

  type FileEdit = {
    file: string;
    oldCode: string;
    newCode: string;
  };
  const edits: FileEdit[] = filesToEdit.map((file) => {
    const oldCode = readFileContents(file);
    const imports = groupedImportEdits[file] || [];
    const exports = groupedExportEdits[file] || [];
    const newCode = performImportEditsOnFile(oldCode, imports, exports);
    return { file, oldCode, newCode };
  });
  const isJs = isFolderMostlyJsFiles(selectedDirectory);
  for (const edit of edits) {
    writeToFile(edit.file, edit.newCode, useFs);
  }

  createNewFile(
    `${selectedDirectory}/index.${isJs ? "js" : "ts"}`,
    createCodeForExports(info.newExportProxies)
  );
  return `Done! ${edits.length} File${edits.length === 1 ? "" : "s"} Editted.`;
}
