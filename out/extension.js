"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const deleteIndexFile_1 = require("./core/deleteIndexFile");
const generateUnusedExports_1 = require("./core/generateUnusedExports");
const generateVirtualIndex_1 = require("./core/generateVirtualIndex");
const viewFolderImports_1 = require("./core/viewFolderImports");
const warmUpCache_1 = require("./parser/warmUpCache");
const utils_1 = require("./utils");
function activate({ subscriptions }) {
    let fileOutput = "";
    const SCHEME = "exports";
    console.log("Running!");
    (0, warmUpCache_1.warmUpCache)();
    function registerCommand(commandKey, callback) {
        subscriptions.push(vscode.commands.registerCommand(commandKey, async (menuInfo) => {
            vscode.window.withProgress({ location: vscode.ProgressLocation.Notification }, async (reporter) => {
                reporter.report({ message: "Processing..." });
                await new Promise((res) => setTimeout(res, 0));
                const workspaceDirectory = (0, utils_1.getWorkspace)();
                const selectedPath = menuInfo.fsPath;
                if (!workspaceDirectory) {
                    return vscode.window.showInformationMessage("No Selected Workspace");
                }
                if (!selectedPath) {
                    return vscode.window.showInformationMessage("No Selected Path");
                }
                try {
                    fileOutput = await callback(workspaceDirectory, selectedPath);
                    if (!fileOutput) {
                        fileOutput = "Nothing To Show";
                    }
                    const uri = vscode.Uri.parse((0, utils_1.generateUri)(SCHEME, "index", ".ts"));
                    const doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
                    await vscode.window.showTextDocument(doc, { preview: false });
                }
                catch (e) {
                    vscode.window.showErrorMessage(`Error: ${e}`);
                    console.log(e);
                }
            });
        }));
    }
    subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(SCHEME, new (class {
        provideTextDocumentContent(uri) {
            return fileOutput;
        }
    })()));
    registerCommand("helloworld.virtual_index", async (workspaceDirectory, selectedPath) => {
        return (0, generateVirtualIndex_1.generateVirtualIndex)(workspaceDirectory, selectedPath);
    });
    registerCommand("helloworld.unused_exports", async (workspaceDirectory, selectedPath) => {
        return (0, generateUnusedExports_1.generateUnusedExports)(workspaceDirectory, selectedPath);
    });
    registerCommand("helloworld.folder_imports", async (workspaceDirectory, selectedPath) => {
        return (0, viewFolderImports_1.viewFolderImports)(workspaceDirectory, selectedPath);
    });
    registerCommand("helloworld.delete_index", async (workspaceDirectory, selectedPath) => {
        return (0, deleteIndexFile_1.deleteIndexFile)(workspaceDirectory, selectedPath);
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map