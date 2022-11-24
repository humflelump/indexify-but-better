import { groupBy, orderBy } from "lodash";
import { getAbsolutePath } from "../file-traverse/getAbsolutePath";
import { getAllFilesInFolder } from "../file-traverse/getAllFilesInFolder";
import { AnyNode, ExportNode, NewExport, NodeWithSource } from "../types";

export class ExportGraph {
  groupByImport: { [source: string]: NodeWithSource[] } = {};
  nodes: AnyNode[] = [];

  constructor(nodes: AnyNode[]) {
    this.nodes = nodes;
    const importNodes = nodes.filter(
      (d) => d.type !== "NewExport"
    ) as NodeWithSource[];
    this.groupByImport = groupBy(importNodes, (d) => d.source);
  }

  public traverse(node: NewExport, callback: (node: AnyNode) => void) {
    const traverse = (
      node: AnyNode,
      variable: string,
      visits: Set<AnyNode>
    ) => {
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
        } else if (child.type === "ExportAllProxy") {
          callback(child);
          traverse(
            child,
            child.exportName ? child.exportName : variable,
            visits
          );
        } else if (child.type === "Import") {
          if (child.name === variable) {
            callback(child);
          }
        } else if (child.type === "ImportAll") {
          callback(child);
        }
      }
    };
    callback(node);
    traverse(node, node.name, new Set());
  }

  public getNodes() {
    return this.nodes;
  }
}
