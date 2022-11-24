import { NewExport } from "../types";
import { ExportGraph } from "./Graph";

export function referenceCountIntoFolder(graph: ExportGraph, folder: string) {
  function isDirectoryOutsideOfFolder(file: string) {
    return !file.startsWith(folder);
  }

  const nodes: NewExport[] = graph
    .getNodes()
    .filter((d) => d.type === "NewExport")
    .filter((d) => isDirectoryOutsideOfFolder(d.file)) as NewExport[];

  function getCount(node: NewExport): number {
    let count = 0;
    graph.traverse(node, (child) => {
      if (
        !isDirectoryOutsideOfFolder(child.file) &&
        (child.type === "Import" || child.type === "ImportAll")
      ) {
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
    .filter((d) => d.count > 0);
  return result;
}
