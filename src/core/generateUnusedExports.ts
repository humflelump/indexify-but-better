import { getRelativePath } from "../file-traverse/getRelativePath";
import { createGraph } from "../graph/createGraph";
import { unusedExports } from "../graph/unusedExports";

export function generateUnusedExports(
  workspaceDirectory: string,
  selectedDirectory: string
) {
  const graph = createGraph(workspaceDirectory, workspaceDirectory);
  let nodes = unusedExports(graph, selectedDirectory);
  const sections = nodes.map((node) => {
    const to = node.file;
    const from = selectedDirectory + "/index";
    return `export { ${node.name} } from '${getRelativePath(from, to)}';
    
`;
  });
  return sections.join("");
}
