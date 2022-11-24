"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportGraph = void 0;
const lodash_1 = require("lodash");
class ExportGraph {
    constructor(nodes) {
        this.groupByImport = {};
        this.nodes = [];
        this.nodes = nodes;
        const importNodes = nodes.filter((d) => d.type !== "NewExport");
        this.groupByImport = (0, lodash_1.groupBy)(importNodes, (d) => d.source);
    }
    traverse(node, callback) {
        const traverse = (node, variable, visits) => {
            if (visits.has(node)) {
                return;
            }
            visits.add(node);
            const possibleChildren = this.groupByImport[node.file] || [];
            for (const child of possibleChildren) {
                if (child.type === "ExportProxy") {
                    if (child.importName === variable) {
                        callback(child);
                        traverse(child, child.exportName, visits);
                    }
                }
                else if (child.type === "ExportAllProxy") {
                    callback(child);
                    traverse(child, child.exportName ? child.exportName : variable, visits);
                }
                else if (child.type === "Import") {
                    if (child.name === variable) {
                        callback(child);
                    }
                }
                else if (child.type === "ImportAll") {
                    callback(child);
                }
            }
        };
        callback(node);
        traverse(node, node.name, new Set());
    }
    getNodes() {
        return this.nodes;
    }
}
exports.ExportGraph = ExportGraph;
//# sourceMappingURL=Graph.js.map