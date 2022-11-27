"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unusedExports = void 0;
const isFileInDirectory_1 = require("../file-helpers/isFileInDirectory");
function unusedExports(graph, folder) {
    console.log({ folder });
    const nodes = graph
        .getNodes()
        .filter((d) => d.type === "NewExport");
    function getCount(node) {
        let count = 0;
        graph.traverse(node, (child) => {
            if (child.type === "Import" || child.type === "ImportAll") {
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
        .filter((d) => d.count === 0)
        .filter((d) => (0, isFileInDirectory_1.isFileInDirectory)(d.file, folder));
    return result;
}
exports.unusedExports = unusedExports;
//# sourceMappingURL=unusedExports.js.map