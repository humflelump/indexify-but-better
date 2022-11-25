"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVirtualIndex = void 0;
const lodash_1 = require("lodash");
const createGraph_1 = require("../graph/createGraph");
const referenceCountOutOfFolder_1 = require("../graph/referenceCountOutOfFolder");
const getRelativePath_1 = require("../file-helpers/getRelativePath");
function generateVirtualIndex(workspaceDirectory, selectedDirectory) {
    const graph = (0, createGraph_1.createGraph)(workspaceDirectory, workspaceDirectory);
    let nodes = (0, referenceCountOutOfFolder_1.referenceCountOutOfFolder)(graph, selectedDirectory);
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
exports.generateVirtualIndex = generateVirtualIndex;
//# sourceMappingURL=generateVirtualIndex.js.map