import * as vscode from "vscode";

let count = 0;

export function generateUri(scheme: string, title: string, extension: string) {
  const uri = `${scheme}:${title}_${count}${extension}`;
  count += 1;
  return uri;
}

export function getWorkspace() {
  const workspaceDirectory = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  return workspaceDirectory;
}

export function deleteRanges(str: string, ranges: [number, number][]) {
  const counts = Array(str.length + 1).fill(0);
  for (const [a, b] of ranges) {
    counts[a] += 1;
    counts[b] -= 1;
  }

  let count = 0;
  const result: string[] = [];
  for (let i = 0; i < str.length; i += 1) {
    count += counts[i];
    if (count === 0) {
      result.push(str[i]);
    }
  }
  return result.join("");
}
