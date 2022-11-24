"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referenceCountIntoFolder = void 0;
function referenceCountIntoFolder(graph, folder) {
    function isDirectoryOutsideOfFolder(file) {
        return !file.startsWith(folder);
    }
    const nodes = graph
        .getNodes()
        .filter((d) => d.type === "NewExport")
        .filter((d) => isDirectoryOutsideOfFolder(d.file));
    function getCount(node) {
        let count = 0;
        graph.traverse(node, (child) => {
            if (!isDirectoryOutsideOfFolder(child.file) &&
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
exports.referenceCountIntoFolder = referenceCountIntoFolder;
//# sourceMappingURL=referenceCountIntoFolder.js.map