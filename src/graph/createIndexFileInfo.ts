import { groupBy, keyBy } from "lodash";
import {
  AnyNode,
  BasicImport,
  ExportProxy,
  ExportTransform,
  ImportTransform,
  NewExport,
} from "../types";
import { isValidJsVariable } from "../utils";
import { ExportGraph } from "./Graph";

const createVariableGenerator = () => {
  let varCounter = 0;
  let varSet = new Set<string>();
  function genVariable(variable: string, secondary: string) {
    if (!varSet.has(variable)) {
      varSet.add(variable);
      return variable;
    }
    let potentialVariable = secondary;
    while (
      varSet.has(potentialVariable) ||
      !isValidJsVariable(potentialVariable)
    ) {
      varCounter += 1;
      potentialVariable = `${variable}_RENAME_${varCounter}`;
    }
    varSet.add(potentialVariable);
    return potentialVariable;
  }
  return genVariable;
};

type ProxiedVariables = {
  exportNode: AnyNode;
  importNode: AnyNode;
  exportVariable: string;
  importVariable: string;
};

export function createIndexFileInfo(
  graph: ExportGraph,
  selectedDirectory: string
) {
  function inDirectory(file: string) {
    return file.startsWith(selectedDirectory);
  }

  const newExports = graph
    .getNodes()
    .filter((d) => d.type === "NewExport") as NewExport[];
  const result: ProxiedVariables[] = [];
  for (const node of newExports) {
    graph.traverse(node, (next, variable, prevNode, prevVariable) => {
      if (
        next.type !== "ImportAll" &&
        inDirectory(prevNode.file) &&
        !inDirectory(next.file)
      ) {
        result.push({
          exportNode: prevNode,
          importNode: next,
          exportVariable: prevVariable,
          importVariable: variable,
        });
      }
    });
  }

  const groupedByExport = groupBy(
    result,
    (node) => `${node.exportNode.file}_${node.exportVariable}`
  );

  const genVariable = createVariableGenerator();

  const importTransforms: ImportTransform[] = [];
  const exportTransform: ExportTransform[] = [];
  const newExportProxies: ExportProxy[] = [];

  Object.keys(groupedByExport).forEach((key) => {
    const list = groupedByExport[key];
    const exportNode = list[0].exportNode;
    const exportVariable = list[0].exportVariable;
    const possibleName = (function getFilename() {
      const split = exportNode.file.split("/");
      return String(split[split.length - 1]);
    })();

    const proxiedVariable = genVariable(exportVariable, possibleName);
    const indexProxy: ExportProxy = {
      type: "ExportProxy",
      file: selectedDirectory + "/index",
      source: exportNode.file,
      range: [0, 0],
      importName: exportVariable,
      exportName: proxiedVariable,
    };
    newExportProxies.push(indexProxy);
  });

  function hash(originalFile: string, importedName: string) {
    return `${originalFile}_${importedName}`;
  }

  const exportProxyByFileAndVariable = keyBy(newExportProxies, (d) =>
    hash(d.source, d.importName)
  );

  const groupedByImport = groupBy(result, (d) => JSON.stringify(d.importNode));

  Object.keys(groupedByImport).forEach((key) => {
    const list = groupedByImport[key];

    if (list[0].importNode.type === "NewExport") {
      throw Error("Unexpected Error: Trying to link new export");
    }
    if (list[0].importNode.type === "ImportAll") {
      throw Error("Import All Statements Unsupported");
    }
    if (list[0].importNode.type === "Import") {
      if (list.length !== 1) {
        throw Error(`Unexpected Error: Multiple imports found`);
      }
      const importNode = list[0].importNode;
      const proxyNode =
        exportProxyByFileAndVariable[
          hash(list[0].exportNode.file, list[0].exportVariable)
        ];
      if (!proxyNode) {
        throw Error(
          `Failed to find ${list[0].exportVariable} in ${list[0].exportNode.file}`
        );
      }
      const newImport: BasicImport = {
        type: "Import",
        file: importNode.file,
        source: proxyNode.file,
        range: [0, 0],
        name: proxyNode.exportName,
        moduleName: importNode.moduleName,
      };
      importTransforms.push({
        original: importNode,
        next: [newImport],
      });
    }
    if (list[0].importNode.type === "ExportProxy") {
      if (list.length !== 1) {
        throw Error(`Unexpected Error: Multiple export proxies found`);
      }
      const exportProxyNode = list[0].importNode;
      const proxyNode =
        exportProxyByFileAndVariable[
          hash(list[0].exportNode.file, list[0].exportVariable)
        ];
      if (!proxyNode) {
        throw Error(
          `Failed to find ${list[0].exportVariable} in ${list[0].exportNode.file}`
        );
      }
      const newExportProxy: ExportProxy = {
        type: "ExportProxy",
        file: exportProxyNode.file,
        source: proxyNode.file,
        range: [0, 0],
        importName: proxyNode.exportName,
        exportName: exportProxyNode.exportName,
      };
      exportTransform.push({
        original: exportProxyNode,
        next: [newExportProxy],
      });
    }
    if (list[0].importNode.type === "ExportAllProxy") {
      const exportAllNode = list[0].importNode;
      if (exportAllNode.exportName) {
        throw Error(
          `'export * as X' syntax unsupported do to potential naming conflicts`
        );
      }
      const edits = list.map((obj) => {
        const proxyNode =
          exportProxyByFileAndVariable[
            hash(obj.exportNode.file, obj.exportVariable)
          ];
        if (!proxyNode) {
          throw Error(
            `Failed to find ${obj.exportVariable} in ${obj.exportNode.file}`
          );
        }
        const reExport: ExportProxy = {
          type: "ExportProxy",
          file: exportAllNode.file,
          source: proxyNode.file,
          range: [0, 0],
          importName: proxyNode.exportName,
          exportName: obj.exportVariable,
        };
        return reExport;
      });
      exportTransform.push({
        original: exportAllNode,
        next: edits,
      });
    }
  });

  return { importTransforms, exportTransform, newExportProxies };
}
