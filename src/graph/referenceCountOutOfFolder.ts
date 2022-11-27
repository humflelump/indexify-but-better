import { isFileInDirectory } from "../file-helpers/isFileInDirectory";
import { NewExport } from "../types";
import { ExportGraph } from "./Graph";

export function referenceCountOutOfFolder(graph: ExportGraph, folder: string) {
  const nodes: NewExport[] = graph
    .getNodes()
    .filter((d) => d.type === "NewExport")
    .filter((d) => isFileInDirectory(d.file, folder)) as NewExport[];

  function getCount(node: NewExport): number {
    let count = 0;
    graph.traverse(node, (child) => {
      if (
        !isFileInDirectory(child.file, folder) &&
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
