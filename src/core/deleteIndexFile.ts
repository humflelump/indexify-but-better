import { groupBy, keys } from "lodash";
import { deleteFile } from "../file-helpers/deleteFile";
import { folderForClickedIndexFile } from "../file-helpers/folderForClickedIndexFile";
import { getIndexFilesInFolder } from "../file-helpers/getIndexFilesInFolder";
import { readFileContents } from "../file-helpers/readFileContents";
import { removeFileExtension } from "../file-helpers/removeFileExtension";
import { writeToFile } from "../file-helpers/writeToFile";
import { createGraph } from "../graph/createGraph";
import {
  deleteIndexFileInfo,
  getProxiedFilesInfo,
  transformExports,
} from "../graph/deleteIndexFileInfo";
import { performImportEditsOnFile } from "../parser/performImportEditsOnFile";
import { ExportNode, ImportNode } from "../types";

export function deleteIndexFile(
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
  if (indexFiles.length === 0) {
    throw Error("No index files found");
  } else if (indexFiles.length > 1) {
    throw Error(`Multiple index files found: ${indexFiles.join(", ")}`);
  }
  const importNodes = graph
    .getNodes()
    .filter(
      (d) => d.type === "Import" || d.type === "ImportAll"
    ) as ImportNode[];
  const exportNodes = graph
    .getNodes()
    .filter(
      (d) => d.type === "ExportAllProxy" || d.type === "ExportProxy"
    ) as ExportNode[];
  const groupedImportsByFile = groupBy(importNodes, (d) => d.fileWithExtension);
  const groupedExportsByFile = groupBy(exportNodes, (d) => d.fileWithExtension);
  const indexFile = indexFiles[0];
  const indexFileNoExtension = removeFileExtension(indexFile);
  const proxied = deleteIndexFileInfo(graph, indexFile);
  const allFiles = Array.from(
    new Set([...keys(groupedExportsByFile), ...keys(groupedImportsByFile)])
  );
  type FileEdit = {
    file: string;
    oldCode: string;
    newCode: string;
  };
  const edits: FileEdit[] = [];
  for (const file of allFiles) {
    const imports = groupedImportsByFile[file] || [];
    const exports = groupedExportsByFile[file] || [];
    const exportsToFix = transformExports(
      indexFileNoExtension,
      proxied,
      exports
    );
    const importsToFix = getProxiedFilesInfo(
      indexFileNoExtension,
      proxied,
      imports
    );
    if (importsToFix.length || exportsToFix.length) {
      const oldCode = readFileContents(file);
      const newCode = performImportEditsOnFile(
        oldCode,
        importsToFix,
        exportsToFix
      );
      edits.push({ file, oldCode, newCode: newCode });
    }
  }
  for (const edit of edits) {
    writeToFile(edit.file, edit.newCode, useFs);
  }
  deleteFile(indexFile);
  return `Done! ${edits.length} File${edits.length === 1 ? "" : "s"} Editted.`;
}
