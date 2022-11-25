"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUnusedExports = void 0;
const getRelativePath_1 = require("../file-helpers/getRelativePath");
const createGraph_1 = require("../graph/createGraph");
const unusedExports_1 = require("../graph/unusedExports");
function generateUnusedExports(workspaceDirectory, selectedDirectory) {
    const graph = (0, createGraph_1.createGraph)(workspaceDirectory, workspaceDirectory);
    let nodes = (0, unusedExports_1.unusedExports)(graph, selectedDirectory);
    const sections = nodes.map((node) => {
        const to = node.file;
        const from = selectedDirectory + "/index";
        return `export { ${node.name} } from '${(0, getRelativePath_1.getRelativePath)(from, to)}';
    
`;
    });
    return sections.join("");
}
exports.generateUnusedExports = generateUnusedExports;
//# sourceMappingURL=generateUnusedExports.js.map