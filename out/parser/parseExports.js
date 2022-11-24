"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExports = void 0;
const constants_1 = require("../constants");
const memoizedParse_1 = require("./memoizedParse");
const searchNode_1 = require("./searchNode");
function parseExports(sourceCode, filename) {
    const node = (0, memoizedParse_1.memoizedParse)(sourceCode, constants_1.PARSER_OPTIONS);
    const results = [];
    (function handleNamedExports() {
        const namedExports = node.body.filter((d) => d.type === "ExportNamedDeclaration" && !d.source);
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
        const criteria = (obj) => obj?.type === "Identifier" && obj?.name;
        const filterKey = (key, obj) => {
            return allowed.has(key);
        };
        namedExports.forEach((exportNode) => {
            const found = (0, searchNode_1.searchNode)(exportNode, filterKey, criteria);
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
        const defaultExports = node.body.filter((d) => d.type === "ExportDefaultDeclaration");
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
        const proxyExports = node.body.filter((d) => d.type === "ExportNamedDeclaration" && d.source?.value);
        const allowed = new Set(["specifiers"]);
        const criteria = (obj) => obj?.type === "ExportSpecifier" &&
            obj?.local?.name &&
            obj?.exported?.name;
        const filterKey = (key, obj) => {
            return allowed.has(key);
        };
        proxyExports.forEach((exportNode) => {
            const found = (0, searchNode_1.searchNode)(exportNode, filterKey, criteria);
            found.forEach((node) => {
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
        const proxyExports = node.body.filter((d) => d.type === "ExportAllDeclaration");
        proxyExports.forEach((exportNode) => {
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
exports.parseExports = parseExports;
//# sourceMappingURL=parseExports.js.map