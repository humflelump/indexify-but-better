"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidJsVariable = exports.deleteRanges = exports.getWorkspace = exports.generateUri = void 0;
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
function deleteRanges(str, ranges) {
    const counts = Array(str.length + 1).fill(0);
    for (const [a, b] of ranges) {
        counts[a] += 1;
        counts[b] -= 1;
    }
    let count = 0;
    const result = [];
    for (let i = 0; i < str.length; i += 1) {
        count += counts[i];
        if (count === 0) {
            result.push(str[i]);
        }
    }
    return result.join("");
}
exports.deleteRanges = deleteRanges;
var varVal = require("var-validator");
function isValidJsVariable(s) {
    return varVal.isValid(s);
}
exports.isValidJsVariable = isValidJsVariable;
//# sourceMappingURL=utils.js.map