"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewFolderImports = void 0;
const lodash_1 = require("lodash");
const getRelativePath_1 = require("../file-traverse/getRelativePath");
const createGraph_1 = require("../graph/createGraph");
const referenceCountIntoFolder_1 = require("../graph/referenceCountIntoFolder");
function viewFolderImports(workspaceDirectory, selectedDirectory) {
    const graph = (0, createGraph_1.createGraph)(workspaceDirectory, workspaceDirectory);
    let nodes = (0, referenceCountIntoFolder_1.referenceCountIntoFolder)(graph, selectedDirectory);
    nodes = (0, lodash_1.sortBy)(nodes, (d) => -d.count);
    const sections = nodes.map((node) => {
        const to = node.file;
        const from = selectedDirectory + "/index";
        return `// ${node.count} Reference${node.count === 1 ? "" : "s"}
export { ${node.name} } from '${(0, getRelativePath_1.getRelativePath)(from, to)}';

`;
    });
    return sections.join("");
}
exports.viewFolderImports = viewFolderImports;
//# sourceMappingURL=viewFolderImports.js.map