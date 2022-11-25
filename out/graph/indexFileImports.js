"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexFileImports = exports.transformExports = exports.transformImports = void 0;
const lodash_1 = require("lodash");
const readFileContents_1 = require("../file-traverse/readFileContents");
const removeFileExtension_1 = require("../file-traverse/removeFileExtension");
const parseExports_1 = require("../parser/parseExports");
const parseImports_1 = require("../parser/parseImports");
function transformImports(indexFile, proxiedFiles, imports) {
    const indexedImports = (0, lodash_1.keyBy)(proxiedFiles, (d) => d.exportedFromIndex);
    const result = [];
    imports.forEach((node) => {
        if (node.source !== indexFile) {
            return;
        }
        if (node.type === "ImportAll") {
            if (node.moduleName) {
                throw Error(`Cannot 'import * as X' in: ${node.file}`);
            }
            const newImports = proxiedFiles.map((proxy) => {
                return {
                    file: node.file,
                    source: proxy.proxiedFile,
                    range: [0, 0],
                    type: "Import",
                    moduleName: proxy.exportedFromIndex,
                    name: proxy.exportedFromFile,
                };
            });
            result.push({
                original: node,
                next: newImports,
            });
        }
        else if (node.type === "Import") {
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
exports.transformImports = transformImports;
function transformExports(indexFile, proxiedFiles, exports) {
    const indexedExports = (0, lodash_1.keyBy)(proxiedFiles, (d) => d.exportedFromIndex);
    const result = [];
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
            const newExports = proxiedFiles.map((proxy) => {
                return {
                    range: [0, 0],
                    file: node.file,
                    type: "ExportProxy",
                    source: proxy.proxiedFile,
                    exportName: proxy.exportedFromIndex,
                    importName: proxy.exportedFromFile,
                };
            });
            result.push({
                original: node,
                next: newExports,
            });
        }
        else if (node.type === "ExportProxy") {
            const proxy = indexedExports[node.importName];
            if (!proxy) {
                throw Error(`Could not import variable='${node.importName}' in ${node.file}`);
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
                    },
                ],
            });
        }
    });
    return result;
}
exports.transformExports = transformExports;
function indexFileImports(graph, indexFile) {
    const code = (0, readFileContents_1.readFileContents)(indexFile);
    const imports = (0, parseImports_1.parseImports)(code, indexFile);
    if (imports.length > 0) {
        throw Error(`index file must not contain imports`);
    }
    const exports = (0, parseExports_1.parseExports)(code, indexFile);
    if (exports.find((d) => d.type === "NewExport")) {
        throw Error(`index file must not create new exports`);
    }
    if (exports.find((d) => d.type === "ExportAllProxy" && d.exportName)) {
        throw Error(`index file must not aggregate imports into a single variable`);
    }
    const fileWithoutExtension = (0, removeFileExtension_1.removeFileExtension)(indexFile);
    const newExports = graph
        .getNodes()
        .filter((d) => d.type === "NewExport");
    const proxiedFiles = [];
    for (const node of newExports) {
        let prevNode = node;
        let prevVariable = node.name;
        graph.traverse(node, (next, variable) => {
            if (next.file === fileWithoutExtension) {
                proxiedFiles.push({
                    indexFile: fileWithoutExtension,
                    proxiedFile: prevNode.file,
                    exportedFromFile: prevVariable,
                    exportedFromIndex: variable,
                });
            }
            prevNode = next;
            prevVariable = variable;
        });
    }
    return proxiedFiles;
}
exports.indexFileImports = indexFileImports;
//# sourceMappingURL=indexFileImports.js.map