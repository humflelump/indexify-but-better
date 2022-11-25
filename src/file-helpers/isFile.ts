const fs = require("fs");

export function isFile(file: string) {
  try {
    return fs.lstatSync(file).isFile();
  } catch (e) {
    return false;
  }
}
