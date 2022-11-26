"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCodeForExports = exports.performImportEditsOnFile = void 0;
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const getRelativePath_1 = require("../file-helpers/getRelativePath");
const utils_1 = require("../utils");
const memoizedParse_1 = require("./memoizedParse");
const organizeImports_1 = require("./organizeImports");
function exportProxyToString(exp) {
    const relativeImport = (0, getRelativePath_1.getRelativePath)(exp.file, exp.source);
    if (exp.exportName === exp.importName) {
        return `export { ${exp.importName} } from '${relativeImport}';`;
    }
    else {
        return `export { ${exp.importName} as ${exp.exportName} } from '${relativeImport}';`;
    }
}
function importToString(imp) {
    const relativeImport = (0, getRelativePath_1.getRelativePath)(imp.file, imp.source);
    if (imp.name === "default") {
        return `import ${imp.moduleName} from '${relativeImport}';`;
    }
    else if (imp.name === imp.moduleName) {
        return `import { ${imp.name} } from '${relativeImport}';`;
    }
    else {
        return `import { ${imp.name} as ${imp.moduleName} } from '${relativeImport}';`;
    }
}
const NEWLINE = `
`;
function getIndexBeforeImports(code) {
    const node = (0, memoizedParse_1.memoizedParse)(code, constants_1.PARSER_OPTIONS);
    const imports = node.body.filter((d) => d.type === "ImportDeclaration");
    if (imports.length === 0) {
        return 0;
    }
    return imports[0].range[0];
}
function performImportEditsOnFile(code, importEdits, exportEdits) {
    const indexBeforeImports = getIndexBeforeImports(code);
    const codeBeforeImports = code.slice(0, indexBeforeImports);
    let rangesToDelete = [
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
    code = (0, utils_1.deleteRanges)(code, rangesToDelete);
    const exportsToAdd = (0, lodash_1.flatten)(exportEdits.map((d) => d.next));
    const exportStringsToAdd = exportsToAdd.map(exportProxyToString);
    if (exportStringsToAdd.length) {
        code += NEWLINE + exportStringsToAdd.join(NEWLINE);
    }
    const importsToAdd = (0, lodash_1.flatten)(importEdits.map((d) => d.next));
    const importStringsToAdd = importsToAdd.map(importToString);
    if (importStringsToAdd.length) {
        code = importStringsToAdd.join(NEWLINE) + code;
    }
    code = (0, organizeImports_1.organizeImports)(code);
    return codeBeforeImports + code;
}
exports.performImportEditsOnFile = performImportEditsOnFile;
function createCodeForExports(exports) {
    const groupedByPath = (0, lodash_1.groupBy)(exports, (d) => (0, getRelativePath_1.getRelativePath)(d.file, d.source));
    const statements = Object.keys(groupedByPath).map((path) => {
        const exports = groupedByPath[path];
        const variables = exports.map((exp) => {
            if (exp.exportName === exp.importName) {
                return exp.importName;
            }
            else {
                return `${exp.importName} as ${exp.exportName}`;
            }
        });
        return `export { ${variables.join(", ")} } from '${path}';`;
    });
    return statements.join("\n");
}
exports.createCodeForExports = createCodeForExports;
//# sourceMappingURL=performImportEditsOnFile.js.map