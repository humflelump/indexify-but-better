import * as vscode from "vscode";
const fs = require("fs");

export function writeToFile(file: string, content: string, useFs: boolean) {
  if (useFs) {
    fs.writeFileSync(file, content);
  } else {
    const uri = vscode.Uri.parse("file://" + file);
    vscode.workspace.openTextDocument(uri).then((doc) => {
      const edit = new vscode.WorkspaceEdit();
      edit.replace(
        uri,
        new vscode.Range(
          doc.lineAt(0).range.start,
          doc.lineAt(doc.lineCount - 1).range.end
        ),
        content
      );
      return vscode.workspace
        .applyEdit(edit)
        .then((success) => {
          if (!success) {
            vscode.window.showInformationMessage("Error!");
          }
        })
        .then(() => doc.save());
    });
  }
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
