export function removeFileExtension(file: string) {
  for (let i = file.length - 1; i >= 1; i--) {
    const c = file[i];
    if (c === "/") {
      return file;
    }
    if (c === ".") {
      return file.slice(0, i);
    }
  }
  return file;
}
