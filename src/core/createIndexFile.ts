import { groupBy, uniq } from "lodash";
import { createNewFile } from "../file-helpers/createNewFile";
import { getIndexFilesInFolder } from "../file-helpers/getIndexFilesInFolder";
import { isFile } from "../file-helpers/isFile";
import { readFileContents } from "../file-helpers/readFileContents";
import { writeToFile } from "../file-helpers/writeToFile";
import { createGraph } from "../graph/createGraph";
import { createIndexFileInfo } from "../graph/createIndexFileInfo";
import {
  createCodeForExports,
  performImportEditsOnFile,
} from "../parser/performImportEditsOnFile";

export function createIndexFile(
  workspaceDirectory: string,
  selectedDirectory: string
) {
  if (isFile(selectedDirectory)) {
    throw Error("Must select a folder");
  }
  const graph = createGraph(workspaceDirectory);
  const indexFiles = getIndexFilesInFolder(selectedDirectory);
  if (indexFiles.length > 1) {
    throw Error(`Multiple index files found: ${indexFiles.join(", ")}`);
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
  for (const edit of edits) {
    writeToFile(edit.file, edit.newCode);
  }
  createNewFile(
    `${selectedDirectory}/index.ts`,
    createCodeForExports(info.newExportProxies)
  );
  return `Done! ${edits.length} File${edits.length === 1 ? "" : "s"} Editted.`;
}
