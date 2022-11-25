import { sortBy } from "lodash";
import { getRelativePath } from "../file-helpers/getRelativePath";
import { createGraph } from "../graph/createGraph";
import { referenceCountIntoFolder } from "../graph/referenceCountIntoFolder";

export function viewFolderImports(
  workspaceDirectory: string,
  selectedDirectory: string
) {
  const graph = createGraph(workspaceDirectory);
  let nodes = referenceCountIntoFolder(graph, selectedDirectory);
  nodes = sortBy(nodes, (d) => -d.count);
  const sections = nodes.map((node) => {
    const to = node.file;
    const from = selectedDirectory + "/index";
    return `// ${node.count} Reference${node.count === 1 ? "" : "s"}
export { ${node.name} } from '${getRelativePath(from, to)}';

`;
  });
  return sections.join("");
}
