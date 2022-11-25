"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performImportEditsOnFile = void 0;
const lodash_1 = require("lodash");
const getRelativePath_1 = require("../file-helpers/getRelativePath");
const utils_1 = require("../utils");
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
function performImportEditsOnFile(code, importEdits, exportEdits) {
    let rangesToDelete = [
        ...importEdits.map((d) => d.original.range),
        ...exportEdits.map((d) => d.original.range),
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
    return code;
}
exports.performImportEditsOnFile = performImportEditsOnFile;
//# sourceMappingURL=performImportEditsOnFile.js.map