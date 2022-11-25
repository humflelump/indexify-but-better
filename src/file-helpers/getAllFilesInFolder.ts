import { ALLOWED_ENTENSIONS } from "../constants";

const fs = require("fs");

function getDirectories(path: string) {
  return fs.readdirSync(path).filter(function a(file: string) {
    return fs.statSync(`${path}/${file}`).isDirectory();
  });
}
function getFiles(path: string) {
  return fs.readdirSync(path).filter(function b(file: string) {
    return !fs.statSync(`${path}/${file}`).isDirectory();
  });
}

export function getAllFilesInFolder(path: string) {
  const result: string[] = [];
  async function helper(path: string) {
    const folders = getDirectories(path);
    const files = getFiles(path);

    for (const file of files) {
      if (!ALLOWED_ENTENSIONS.find((e) => file.endsWith(e))) {
        continue;
      }

      const filepath = `${path}/${file}`;
      result.push(filepath);
    }
    for (const folder of folders) {
      if (folder === "node_modules") {
        continue;
      }
      helper(`${path}/${folder}`);
    }
  }
  helper(path);
  return result;
}

export function getAllFoldersInFolder(path: string) {
  const result: string[] = [];
  async function helper(path: string) {
    result.push(path);
    const folders = getDirectories(path);

    for (const folder of folders) {
      if (folder === "node_modules") {
        continue;
      }
      helper(`${path}/${folder}`);
    }
  }
  helper(path);
  return result;
}
