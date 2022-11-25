import { PARSER_OPTIONS } from "../constants";
import { ImportNode } from "../types";
import { memoizedParse } from "./memoizedParse";
import { searchNode } from "./searchNode";

export function parseImports(
  sourceCode: string,
  filename: string
): ImportNode[] {
  const node = memoizedParse(sourceCode, PARSER_OPTIONS);
  const result: ImportNode[] = [];

  (function handleDynamicImports() {
    const dynamicImports = searchNode(
      node,
      () => true,
      (obj) => {
        return obj?.type === "ImportExpression" && obj?.source?.value;
      }
    );
    dynamicImports.forEach((obj) => {
      result.push({
        file: filename,
        source: String(obj?.source?.value),
        type: "ImportAll",
        range: obj.range,
        moduleName: null,
      });
    });
  })();

  (function handleBasicImports() {
    node.body.forEach((importStatement) => {
      if (importStatement.type !== "ImportDeclaration") {
        return;
      }

      const source = importStatement.source.value;

      if (!source.startsWith(".")) {
        return;
      }

      if (importStatement.specifiers.length === 0) {
        result.push({
          file: filename,
          source,
          type: "ImportAll",
          moduleName: null,
          range: importStatement.range,
        });
      }

      importStatement.specifiers.forEach((specifier) => {
        if (specifier.type === "ImportDefaultSpecifier") {
          result.push({
            file: filename,
            source,
            type: "Import",
            name: "default",
            moduleName: specifier.local.name,
            range: importStatement.range,
          });
        } else if (specifier.type === "ImportNamespaceSpecifier") {
          result.push({
            file: filename,
            source,
            type: "ImportAll",
            moduleName: specifier.local.name,
            range: importStatement.range,
          });
        } else if (specifier.type === "ImportSpecifier") {
          result.push({
            file: filename,
            source,
            type: "Import",
            name: specifier.imported.name,
            moduleName: specifier.local.name,
            range: importStatement.range,
          });
        }
      });
    });
  })();

  return result;
}
