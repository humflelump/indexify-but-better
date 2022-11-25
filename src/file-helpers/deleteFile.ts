var fs = require("fs");

export function deleteFile(file: string) {
  fs.unlinkSync(file);
}
