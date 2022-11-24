"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspace = exports.generateUri = void 0;
const vscode = require("vscode");
let count = 0;
function generateUri(scheme, title, extension) {
    const uri = `${scheme}:${title}_${count}${extension}`;
    count += 1;
    return uri;
}
exports.generateUri = generateUri;
function getWorkspace() {
    const workspaceDirectory = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    return workspaceDirectory;
}
exports.getWorkspace = getWorkspace;
//# sourceMappingURL=utils.js.map