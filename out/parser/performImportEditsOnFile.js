"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCodeForExports = exports.createCodeForImports = exports.performImportEditsOnFile = void 0;
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const getRelativePath_1 = require("../file-helpers/getRelativePath");
const utils_1 = require("../utils");
const memoizedParse_1 = require("./memoizedParse");
const organizeImports_1 = require("./organizeImports");
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
        if (code[b] === "\n") {
            return [a, b + 1];
        }
        return [a, b];
    });
    code = (0, utils_1.deleteRanges)(code, rangesToDelete);
    const exportsToAdd = (0, lodash_1.flatten)(exportEdits.map((d) => d.next));
    if (exportsToAdd.length) {
        code += "\n" + createCodeForExports(exportsToAdd);
    }
    const importsToAdd = (0, lodash_1.flatten)(importEdits.map((d) => d.next));
    if (importsToAdd.length) {
        code = createCodeForImports(importsToAdd) + code;
    }
    code = (0, organizeImports_1.organizeImports)(code);
    return codeBeforeImports + code;
}
exports.performImportEditsOnFile = performImportEditsOnFile;
function groupByPath(nodes) {
    const groupedByPath = (0, lodash_1.groupBy)(nodes, (d) => {
        const path = (0, getRelativePath_1.getRelativePath)(d.file, d.source);
        const split = path.split("/");
        if (split[split.length - 1] === "index") {
            split.pop();
        }
        return split.join("/");
    });
    return groupedByPath;
}
function createCodeForImports(imports) {
    const groupedByPath = groupByPath(imports);
    const statements = Object.keys(groupedByPath).map((path) => {
        let imports = groupedByPath[path];
        const defaultImport = imports.find((d) => d.name === "default");
        imports = imports.filter((d) => d !== defaultImport);
        const variables = imports.map((imp) => {
            if (imp.name === imp.moduleName) {
                return imp.name;
            }
            else {
                return `${imp.name} as ${imp.moduleName}`;
            }
        });
        if (defaultImport && variables.length) {
            const j = variables.join(", ");
            return `import ${defaultImport.moduleName}, { ${j} } from '${path}';`;
        }
        else if (defaultImport && !variables.length) {
            return `import ${defaultImport.moduleName} from '${path}';`;
        }
        else {
            return `import { ${variables.join(", ")} } from '${path}';`;
        }
    });
    return statements.join("\n");
}
exports.createCodeForImports = createCodeForImports;
function createCodeForExports(exports) {
    const groupedByPath = groupByPath(exports);
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