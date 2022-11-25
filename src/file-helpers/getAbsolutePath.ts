const path = require("path");

export function getAbsolutePath(
  absPathToFile: string,
  relPath: string
): string {
  const split = absPathToFile.split("/");
  split.pop();
  return path.resolve(split.join("/"), relPath);
}
