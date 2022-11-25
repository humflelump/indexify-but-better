const fs = require("fs");

export function readFileContents(path: string): string {
  return fs.readFileSync(path, { encoding: "utf8", flag: "r" });
}
