var fs = require("fs");

export function writeToFile(file: string, content: string) {
  fs.writeFileSync(file, content);
}

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
