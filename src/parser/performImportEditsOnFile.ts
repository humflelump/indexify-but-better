import { flatten, groupBy } from "lodash";
import { PARSER_OPTIONS } from "../constants";
import { getRelativePath } from "../file-helpers/getRelativePath";
import {
  BasicImport,
  ExportProxy,
  ExportTransform,
  ImportTransform,
} from "../types";
import { deleteRanges } from "../utils";
import { memoizedParse } from "./memoizedParse";
import { organizeImports } from "./organizeImports";

function exportProxyToString(exp: ExportProxy) {
  const relativeImport = getRelativePath(exp.file, exp.source);
  if (exp.exportName === exp.importName) {
    return `export { ${exp.importName} } from '${relativeImport}';`;
  } else {
    return `export { ${exp.importName} as ${exp.exportName} } from '${relativeImport}';`;
  }
}

function importToString(imp: BasicImport) {
  const relativeImport = getRelativePath(imp.file, imp.source);
  if (imp.name === "default") {
    return `import ${imp.moduleName} from '${relativeImport}';`;
  } else if (imp.name === imp.moduleName) {
    return `import { ${imp.name} } from '${relativeImport}';`;
  } else {
    return `import { ${imp.name} as ${imp.moduleName} } from '${relativeImport}';`;
  }
}

const NEWLINE = `
`;

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
    if (code[b] === NEWLINE) {
      return [a, b + 1];
    }
    return [a, b];
  });
  code = deleteRanges(code, rangesToDelete);
  const exportsToAdd = flatten(exportEdits.map((d) => d.next));
  const exportStringsToAdd = exportsToAdd.map(exportProxyToString);
  if (exportStringsToAdd.length) {
    code += NEWLINE + exportStringsToAdd.join(NEWLINE);
  }
  const importsToAdd = flatten(importEdits.map((d) => d.next));
  const importStringsToAdd = importsToAdd.map(importToString);
  if (importStringsToAdd.length) {
    code = importStringsToAdd.join(NEWLINE) + code;
  }
  code = organizeImports(code);
  return codeBeforeImports + code;
}

export function createCodeForExports(exports: ExportProxy[]) {
  const groupedByPath = groupBy(exports, (d) =>
    getRelativePath(d.file, d.source)
  );
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
