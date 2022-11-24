import * as vscode from "vscode";
import { generateUnusedExports } from "./core/generateUnusedExports";
import { generateVirtualIndex } from "./core/generateVirtualIndex";
import { viewFolderImports } from "./core/viewFolderImports";
import { warmUpCache } from "./parser/warmUpCache";
import { generateUri, getWorkspace } from "./utils";

export function activate({ subscriptions }: vscode.ExtensionContext) {
  let fileOutput = "";
  const SCHEME = "exports";
  console.log("Running!");
  warmUpCache();

  function registerCommand(
    commandKey: string,
    callback: (
      workspaceDirectory: string,
      selectedPath: string
    ) => Promise<string>
  ) {
    type ContextMenuInfo = {
      $mid: number; // 1
      fsPath: string; // "/Users/MMetzger/Desktop/test-app/src/wow"
      external: string; // "file:///Users/MMetzger/Desktop/test-app/src/wow"
      path: string; // "/Users/MMetzger/Desktop/test-app/src/wow"
      scheme: string; // "file"
    };
    subscriptions.push(
      vscode.commands.registerCommand(
        commandKey,
        async (menuInfo: ContextMenuInfo) => {
          vscode.window.withProgress(
            { location: vscode.ProgressLocation.Notification },
            async (reporter) => {
              reporter.report({ message: "Processing..." });
              await new Promise((res) => setTimeout(res, 0));
              const workspaceDirectory = getWorkspace();
              const selectedPath = menuInfo.fsPath;
              if (!workspaceDirectory) {
                return vscode.window.showInformationMessage(
                  "No Selected Workspace"
                );
              }
              if (!selectedPath) {
                return vscode.window.showInformationMessage("No Selected Path");
              }
              try {
                fileOutput = await callback(workspaceDirectory, selectedPath);

                if (!fileOutput) {
                  fileOutput = "Nothing To Show";
                }

                const uri = vscode.Uri.parse(
                  generateUri(SCHEME, "index", ".ts")
                );
                const doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
                await vscode.window.showTextDocument(doc, { preview: false });
              } catch (e) {
                console.log(e);
              }
            }
          );
        }
      )
    );
  }

  subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      SCHEME,
      new (class implements vscode.TextDocumentContentProvider {
        provideTextDocumentContent(uri: vscode.Uri): string {
          return fileOutput;
        }
      })()
    )
  );

  registerCommand(
    "helloworld.virtual_index",
    async (workspaceDirectory, selectedPath) => {
      return generateVirtualIndex(workspaceDirectory, selectedPath);
    }
  );

  registerCommand(
    "helloworld.unused_exports",
    async (workspaceDirectory, selectedPath) => {
      return generateUnusedExports(workspaceDirectory, selectedPath);
    }
  );

  registerCommand(
    "helloworld.folder_imports",
    async (workspaceDirectory, selectedPath) => {
      return viewFolderImports(workspaceDirectory, selectedPath);
    }
  );
}
