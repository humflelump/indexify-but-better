import { groupBy } from "lodash";
import { AnyNode, NewExport, NodeWithSource } from "../types";

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

  public traverse(
    node: NewExport,
    callback: (
      node: AnyNode,
      variable: string,
      child: AnyNode,
      childVariable: string
    ) => void
  ) {
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
            callback(child, child.exportName, node, variable);
            traverse(child, child.exportName, visits);
          }
        } else if (child.type === "ExportAllProxy") {
          if (variable === "default") {
            return;
          }
          const newVariable = child.exportName ? child.exportName : variable;
          callback(child, newVariable, node, variable);
          traverse(child, newVariable, visits);
        } else if (child.type === "Import") {
          if (child.name === variable) {
            callback(child, variable, node, variable);
          }
        } else if (child.type === "ImportAll") {
          callback(child, variable, node, variable);
        }
      }
    };
    callback(node, node.name, node, node.name);
    traverse(node, node.name, new Set());
  }

  public getNodes() {
    return this.nodes;
  }
}
