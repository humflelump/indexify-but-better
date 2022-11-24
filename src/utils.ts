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
