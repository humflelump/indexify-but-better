import { NewExport } from "../types";
import { ExportGraph } from "./Graph";

export function unusedExports(graph: ExportGraph, folder: string) {
  const nodes: NewExport[] = graph
    .getNodes()
    .filter((d) => d.type === "NewExport") as NewExport[];

  function isDirectoryOutsideOfFolder(file: string) {
    return !file.startsWith(folder);
  }

  function getCount(node: NewExport): number {
    let count = 0;
    graph.traverse(node, (child) => {
      if (child.type === "Import" || child.type === "ImportAll") {
        count += 1;
      }
    });
    return count;
  }
  type NodeWithCount = NewExport & { count: number };
  const result: NodeWithCount[] = nodes
    .map((node) => {
      return {
        ...node,
        count: getCount(node),
      };
    })
    .filter((d) => d.count === 0)
    .filter((d) => !isDirectoryOutsideOfFolder(d.file));
  return result;
}
