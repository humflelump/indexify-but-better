export function isFileInDirectory(file: string, folder: string) {
  const fileSplit = file.split("/");
  const folderSplit = folder.split("/");
  return fileSplit.length > folderSplit.length && file.startsWith(folder);
}
