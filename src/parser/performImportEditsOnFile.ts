import { flatten, groupBy } from "lodash";
import { PARSER_OPTIONS } from "../constants";
import { getRelativePath } from "../file-helpers/getRelativePath";
import {
  BasicImport,
  ExportProxy,
  ExportTransform,
  ImportTransform,
  NodeWithSource,
} from "../types";
import { deleteRanges } from "../utils";
import { memoizedParse } from "./memoizedParse";
import { organizeImports } from "./organizeImports";

function getIndexBeforeImports(code: string) {
  const node = memoizedParse(code, PARSER_OPTIONS);
  const imports = node.body.filter((d) => d.type === "ImportDeclaration");
  if (imports.length === 0) {
    return 0;
  }
  return imports[0].range[0];
}

export function performImportEditsOnFile(
  code: string,
  importEdits: ImportTransform[],
  exportEdits: ExportTransform[]
) {
  const indexBeforeImports = getIndexBeforeImports(code);
  const codeBeforeImports = code.slice(0, indexBeforeImports);
  let rangesToDelete: [number, number][] = [
    ...importEdits.map((d) => d.original.range),
    ...exportEdits.map((d) => d.original.range),
    [0, indexBeforeImports],
  ];
  rangesToDelete = rangesToDelete.map(([a, b]) => {
    if (code[b] === "\n") {
      return [a, b + 1];
    }
    return [a, b];
  });
  code = deleteRanges(code, rangesToDelete);
  const exportsToAdd = flatten(exportEdits.map((d) => d.next));
  if (exportsToAdd.length) {
    code += "\n" + createCodeForExports(exportsToAdd);
  }
  const importsToAdd = flatten(importEdits.map((d) => d.next));
  if (importsToAdd.length) {
    code = createCodeForImports(importsToAdd) + code;
  }
  code = organizeImports(code);
  return codeBeforeImports + code;
}

function groupByPath<T extends NodeWithSource>(nodes: T[]) {
  const groupedByPath = groupBy(nodes, (d) => {
    const path = getRelativePath(d.file, d.source);
    const split = path.split("/");
    if (split[split.length - 1] === "index") {
      split.pop();
    }
    return split.join("/");
  });
  return groupedByPath;
}

export function createCodeForImports(imports: BasicImport[]) {
  const groupedByPath = groupByPath(imports);
  const statements = Object.keys(groupedByPath).map((path) => {
    let imports = groupedByPath[path];
    const defaultImport = imports.find((d) => d.name === "default");
    imports = imports.filter((d) => d !== defaultImport);
    const variables = imports.map((imp) => {
      if (imp.name === imp.moduleName) {
        return imp.name;
      } else {
        return `${imp.name} as ${imp.moduleName}`;
      }
    });
    if (defaultImport && variables.length) {
      const j = variables.join(", ");
      return `import ${defaultImport.moduleName}, { ${j} } from '${path}';`;
    } else if (defaultImport && !variables.length) {
      return `import ${defaultImport.moduleName} from '${path}';`;
    } else {
      return `import { ${variables.join(", ")} } from '${path}';`;
    }
  });
  return statements.join("\n");
}

export function createCodeForExports(exports: ExportProxy[]) {
  const groupedByPath = groupByPath(exports);
  const statements = Object.keys(groupedByPath).map((path) => {
    const exports = groupedByPath[path];
    const variables = exports.map((exp) => {
      if (exp.exportName === exp.importName) {
        return exp.importName;
      } else {
        return `${exp.importName} as ${exp.exportName}`;
      }
    });
    return `export { ${variables.join(", ")} } from '${path}';`;
  });
  return statements.join("\n");
}
