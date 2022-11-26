const fs = require("fs");

export function createNewFile(file: string, content: string) {
  fs.writeFileSync(file, content);
}
