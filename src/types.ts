// IMPORTS

type ImportBase = {
  file: string;
  fileWithExtension?: string;
  source: string;
  range: [number, number];
};

export type BasicImport = {
  type: "Import";
  name: string;
  moduleName: string;
} & ImportBase;

type ImportAll = {
  type: "ImportAll";
  moduleName: string | null;
} & ImportBase;

export type ImportNode = BasicImport | ImportAll;

// EXPORTS

type ExportBase = {
  range: [number, number];
  file: string;
  fileWithExtension?: string;
};

export type NewExport = {
  type: "NewExport";
  isTsType: boolean;
  name: string;
} & ExportBase;

export type ExportProxy = {
  type: "ExportProxy";
  source: string;
  exportName: string;
  importName: string;
  isTsType?: boolean;
} & ExportBase;

type ExportAllProxy = {
  type: "ExportAllProxy";
  source: string;
  exportName: string | null;
} & ExportBase;

// COMBO

export type ExportNode = NewExport | ExportProxy | ExportAllProxy;

export type NodeWithSource = ImportNode | ExportProxy | ExportAllProxy;

export type AnyNode = ImportNode | ExportNode;

// EDITS

export type ImportTransform = {
  original: ImportNode;
  next: BasicImport[];
};

export type ExportTransform = {
  original: ExportNode;
  next: ExportProxy[];
};
