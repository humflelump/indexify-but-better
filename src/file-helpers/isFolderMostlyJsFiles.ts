import { removeFileExtension } from "./removeFileExtension";

const fs = require("fs");

function getFiles(path: string): string[] {
  return fs.readdirSync(path).filter(function b(file: string) {
    return !fs.statSync(`${path}/${file}`).isDirectory();
  });
}

export function isFolderMostlyJsFiles(directory: string) {
  const files = getFiles(directory);
  let js = 0;
  let ts = 0;
  for (const file of files) {
    const prefix = removeFileExtension(file);
    const ext = file.split(prefix)[1]?.toLowerCase();
    if (ext === ".js" || ext === ".jsx") {
      js += 1;
    }
    if (ext === ".ts" || ext === ".tsx") {
      ts += 1;
    }
  }
  return js > ts;
}
