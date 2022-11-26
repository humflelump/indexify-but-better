import { ALLOWED_ENTENSIONS } from "../constants";

export function removeFileExtension(file: string) {
  for (let i = file.length - 1; i >= 1; i--) {
    const c = file[i];
    if (c === "/") {
      return file;
    }
    if (c === ".") {
      if (ALLOWED_ENTENSIONS.includes(file.slice(i))) {
        return file.slice(0, i);
      } else {
        return file;
      }
    }
  }
  return file;
}
