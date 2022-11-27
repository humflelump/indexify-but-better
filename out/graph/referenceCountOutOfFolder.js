"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referenceCountOutOfFolder = void 0;
const isFileInDirectory_1 = require("../file-helpers/isFileInDirectory");
function referenceCountOutOfFolder(graph, folder) {
    const nodes = graph
        .getNodes()
        .filter((d) => d.type === "NewExport")
        .filter((d) => (0, isFileInDirectory_1.isFileInDirectory)(d.file, folder));
    function getCount(node) {
        let count = 0;
        graph.traverse(node, (child) => {
            if (!(0, isFileInDirectory_1.isFileInDirectory)(child.file, folder) &&
                (child.type === "Import" || child.type === "ImportAll")) {
                count += 1;
            }
        });
        return count;
    }
    const result = nodes
        .map((node) => {
        return {
            ...node,
            count: getCount(node),
        };
    })
        .filter((d) => d.count > 0);
    return result;
}
exports.referenceCountOutOfFolder = referenceCountOutOfFolder;
//# sourceMappingURL=referenceCountOutOfFolder.js.map