const path = require("path");

export function getRelativePath(from: string, to: string): string {
  const split = from.split("/");
  split.pop();
  const result = path.relative(split.join("/"), to);
  if (result.startsWith(".")) {return result;}
  return "./" + result;
}
