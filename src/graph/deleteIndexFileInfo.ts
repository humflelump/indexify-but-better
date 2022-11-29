import { keyBy } from "lodash";
import { readFileContents } from "../file-helpers/readFileContents";
import { removeFileExtension } from "../file-helpers/removeFileExtension";
import { parseExports } from "../parser/parseExports";
import { parseImports } from "../parser/parseImports";
import {
  ExportNode,
  ExportProxy,
  ExportTransform,
  ImportNode,
  ImportTransform,
  NewExport,
} from "../types";
import { ExportGraph } from "./Graph";

type ProxiedFile = {
  indexFile: string;
  proxiedFile: string;
  exportedFromFile: string;
  exportedFromIndex: string;
  isTsType: boolean;
};

export function getProxiedFilesInfo(
  indexFile: string,
  proxiedFiles: ProxiedFile[],
  imports: ImportNode[]
) {
  const indexedImports = keyBy(proxiedFiles, (d) => d.exportedFromIndex);
  const result: ImportTransform[] = [];
  imports.forEach((node) => {
    if (node.source !== indexFile) {
      return;
    }
    if (node.type === "ImportAll") {
      if (node.moduleName) {
        throw Error(`Cannot 'import * as X' in: ${node.file}`);
      } else {
        throw Error(`Cannot do a generic import in: ${node.file}`);
      }
    } else if (node.type === "Import") {
      const proxy = indexedImports[node.name];
      if (!proxy) {
        throw Error(`Could not import variable='${node.name}' in ${node.file}`);
      }
      result.push({
        original: node,
        next: [
          {
            file: node.file,
            source: proxy.proxiedFile,
            range: [0, 0],
            type: "Import",
            moduleName: node.moduleName,
            name: proxy.exportedFromFile,
          },
        ],
      });
    }
  });
  return result;
}

export function transformExports(
  indexFile: string,
  proxiedFiles: ProxiedFile[],
  exports: ExportNode[]
) {
  const indexedExports = keyBy(proxiedFiles, (d) => d.exportedFromIndex);
  const result: ExportTransform[] = [];
  exports.forEach((node) => {
    if (node.type === "NewExport") {
      return;
    }
    if (node.source !== indexFile) {
      return;
    }
    if (node.type === "ExportAllProxy") {
      if (node.exportName) {
        throw Error(`Cannot 'export * as X' in: ${node.file}`);
      }
      const newExports: ExportProxy[] = proxiedFiles.map((proxy) => {
        return {
          range: [0, 0],
          file: node.file,
          type: "ExportProxy",
          source: proxy.proxiedFile,
          exportName: proxy.exportedFromIndex,
          importName: proxy.exportedFromFile,
          isTsType: proxy.isTsType,
        };
      });
      result.push({
        original: node,
        next: newExports,
      });
    } else if (node.type === "ExportProxy") {
      const proxy = indexedExports[node.importName];
      if (!proxy) {
        throw Error(
          `Could not import variable='${node.importName}' in ${node.file}`
        );
      }
      result.push({
        original: node,
        next: [
          {
            range: [0, 0],
            file: node.file,
            type: "ExportProxy",
            source: proxy.proxiedFile,
            exportName: node.exportName,
            importName: proxy.exportedFromFile,
            isTsType: proxy.isTsType,
          },
        ],
      });
    }
  });
  return result;
}

export function deleteIndexFileInfo(graph: ExportGraph, indexFile: string) {
  const code = readFileContents(indexFile);
  const imports = parseImports(code, indexFile);
  if (imports.length > 0) {
    throw Error(`index file must not contain imports`);
  }
  const exports = parseExports(code, indexFile);
  if (exports.find((d) => d.type === "NewExport")) {
    throw Error(`index file must not create new exports`);
  }
  if (exports.find((d) => d.type === "ExportAllProxy" && d.exportName)) {
    throw Error(`index file must not aggregate imports into a single variable`);
  }

  const fileWithoutExtension = removeFileExtension(indexFile);
  const newExports = graph
    .getNodes()
    .filter((d) => d.type === "NewExport") as NewExport[];

  const proxiedFiles: ProxiedFile[] = [];

  for (const node of newExports) {
    graph.traverse(node, (next, variable, prevNode, prevVariable) => {
      if (next.file === fileWithoutExtension) {
        proxiedFiles.push({
          indexFile: fileWithoutExtension,
          proxiedFile: prevNode.file,
          exportedFromFile: prevVariable,
          exportedFromIndex: variable,
          isTsType: node.isTsType,
        });
      }
    });
  }

  return proxiedFiles;
}
