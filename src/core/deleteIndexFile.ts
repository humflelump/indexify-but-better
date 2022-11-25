import { groupBy, keys } from "lodash";
import { deleteFile } from "../file-traverse/deleteFile";
import { getIndexFilesInFolder } from "../file-traverse/getIndexFilesInFolder";
import { isFile } from "../file-traverse/isFile";
import { readFileContents } from "../file-traverse/readFileContents";
import { removeFileExtension } from "../file-traverse/removeFileExtension";
import { writeToFile } from "../file-traverse/writeToFile";
import { createGraph } from "../graph/createGraph";
import {
  indexFileImports,
  transformExports,
  transformImports,
} from "../graph/indexFileImports";
import { performImportEditsOnFile } from "../parser/performImportEditsOnFile";
import { ExportNode, ImportNode } from "../types";

export function deleteIndexFile(
  workspaceDirectory: string,
  selectedDirectory: string
) {
  if (isFile(selectedDirectory)) {
    throw Error("Must select a folder");
  }
  const graph = createGraph(workspaceDirectory, workspaceDirectory);
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
  const proxied = indexFileImports(graph, indexFile);
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
    const importsToFix = transformImports(
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
    writeToFile(edit.file, edit.newCode);
  }
  deleteFile(indexFile);
  return JSON.stringify(
    {
      status: "Success!",
      edits,
    },
    undefined,
    2
  );
}
