import { PARSER_OPTIONS } from "../constants";
import { ExportNode } from "../types";
import { memoizedParse } from "./memoizedParse";
import { searchNode } from "./searchNode";

export function parseExports(
  sourceCode: string,
  filename: string
): ExportNode[] {
  const node = memoizedParse(sourceCode, PARSER_OPTIONS);
  const results: ExportNode[] = [];

  (function handleNamedExports() {
    const namedExports = node.body.filter(
      (d) => d.type === "ExportNamedDeclaration" && !d.source
    );
    const allowed = new Set([
      "declaration",
      "declarations",
      "specifiers",
      "id",
      "elements",
      "properties",
      "value",
      "exported",
    ]);
    const criteria = (obj: any) => obj?.type === "Identifier" && obj?.name;
    const filterKey = (key: string, obj: any) => {
      return allowed.has(key);
    };

    namedExports.forEach((exportNode) => {
      const found = searchNode(exportNode, filterKey, criteria);
      found.forEach((node) => {
        results.push({
          type: "NewExport",
          range: exportNode.range,
          file: filename,
          name: node.name,
        });
      });
    });
  })();

  (function handleDefaultExports() {
    const defaultExports = node.body.filter(
      (d) => d.type === "ExportDefaultDeclaration"
    );
    defaultExports.forEach((node) => {
      results.push({
        type: "NewExport",
        range: node.range,
        file: filename,
        name: "default",
      });
    });
  })();

  (function handleProxiedExports() {
    const proxyExports = node.body.filter(
      (d) => d.type === "ExportNamedDeclaration" && d.source?.value
    );
    const allowed = new Set(["specifiers"]);
    const criteria = (obj: any) =>
      obj?.type === "ExportSpecifier" &&
      obj?.local?.name &&
      obj?.exported?.name;
    const filterKey = (key: string, obj: any) => {
      return allowed.has(key);
    };

    proxyExports.forEach((exportNode: any) => {
      const found = searchNode(exportNode, filterKey, criteria);
      found.forEach((node: any) => {
        results.push({
          type: "ExportProxy",
          range: exportNode.range,
          file: filename,
          source: String(exportNode?.source?.value),
          exportName: String(node?.exported?.name),
          importName: String(node?.local?.name),
        });
      });
    });
  })();

  (function handleProxiedExportAll() {
    const proxyExports = node.body.filter(
      (d) => d.type === "ExportAllDeclaration"
    );

    proxyExports.forEach((exportNode: any) => {
      if (!exportNode?.source?.value) {
        return;
      }
      results.push({
        range: exportNode.range,
        file: filename,
        type: "ExportAllProxy",
        source: String(exportNode?.source?.value),
        exportName: exportNode.exported ? exportNode.exported.name : null,
      });
    });
  })();

  return results;
}
