// IMPORTS

type ImportBase = {
  file: string;
  source: string;
};

export type BasicImport = {
  type: "Import";
  name: string;
} & ImportBase;

export type ImportAll = {
  type: "ImportAll";
} & ImportBase;

export type ImportNode = BasicImport | ImportAll;

// EXPORTS

type ExportBase = {
  range: [number, number];
  file: string;
};

export type NewExport = {
  type: "NewExport";
  name: string;
} & ExportBase;

export type ExportProxy = {
  type: "ExportProxy";
  source: string;
  exportName: string;
  importName: string;
} & ExportBase;

export type ExportAllProxy = {
  type: "ExportAllProxy";
  source: string;
  exportName: string | null;
} & ExportBase;

// COMBO

export type ExportNode = NewExport | ExportProxy | ExportAllProxy;

export type NodeWithSource = ImportNode | ExportProxy | ExportAllProxy;

export type AnyNode = ImportNode | ExportNode;
