"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeToFile = void 0;
var fs = require("fs");
function writeToFile(file, content) {
    fs.writeFileSync(file, content);
}
exports.writeToFile = writeToFile;
/*
import * as vscode from "vscode";
var fs = require("fs");

export function writeToFile(file: string, content: string) {
  // await vscode.workspace.fs.writeFile(fileUri, writeData);
  //file:///Users/MMetzger/Desktop/test-app
  try {
    const writeData = Buffer.from(content, "utf8");
    const uri = vscode.Uri.parse("file://" + file);
    vscode.workspace.fs.writeFile(uri, writeData);
  } catch (e) {
    console.log(e);
  }

  // fs.writeFileSync(file, content);
}

*/
//# sourceMappingURL=writeToFile.js.map