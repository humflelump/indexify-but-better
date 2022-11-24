"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseImports = void 0;
const constants_1 = require("../constants");
const memoizedParse_1 = require("./memoizedParse");
const searchNode_1 = require("./searchNode");
function parseImports(sourceCode, filename) {
    const node = (0, memoizedParse_1.memoizedParse)(sourceCode, constants_1.PARSER_OPTIONS);
    const result = [];
    (function handleDynamicImports() {
        const dynamicImports = (0, searchNode_1.searchNode)(node, () => true, (obj) => {
            return obj?.type === "ImportExpression" && obj?.source?.value;
        });
        dynamicImports.forEach((obj) => {
            result.push({
                file: filename,
                source: String(obj?.source?.value),
                type: "ImportAll",
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
                });
            }
            importStatement.specifiers.forEach((specifier) => {
                if (specifier.type === "ImportDefaultSpecifier") {
                    result.push({
                        file: filename,
                        source,
                        type: "Import",
                        name: "default",
                    });
                }
                else if (specifier.type === "ImportNamespaceSpecifier") {
                    result.push({
                        file: filename,
                        source,
                        type: "ImportAll",
                    });
                }
                else if (specifier.type === "ImportSpecifier") {
                    result.push({
                        file: filename,
                        source,
                        type: "Import",
                        name: specifier.imported.name,
                    });
                }
            });
        });
    })();
    return result;
}
exports.parseImports = parseImports;
//# sourceMappingURL=parseImports.js.map