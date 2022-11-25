import { flatten } from "lodash";
import { getRelativePath } from "../file-traverse/getRelativePath";
import {
  BasicImport,
  ExportProxy,
  ExportTransform,
  ImportTransform,
} from "../types";
import { deleteRanges } from "../utils";
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

export function performImportEditsOnFile(
  code: string,
  importEdits: ImportTransform[],
  exportEdits: ExportTransform[]
) {
  let rangesToDelete: [number, number][] = [
    ...importEdits.map((d) => d.original.range),
    ...exportEdits.map((d) => d.original.range),
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
  return code;
}
