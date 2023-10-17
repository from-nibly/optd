export interface SubjectInfo {
  uid: string;
  name: string;
}

export interface StoredHistoryEntry {
  by: SubjectInfo;
  at: Date;
  from: string;
  message?: string;
}

export interface ResourceMeta {
  name: string;
  namespace: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

export interface StoredResourceMeta extends ResourceMeta {
  uid: string;
  owner: SubjectInfo;
}

export interface Resource<Spec, Status> {
  metadata: ResourceMeta;
  spec: Spec;
  status: Status;
}

export interface StoredResource<Spec, Status> extends Resource<Spec, Status> {
  metadata: StoredResourceMeta;
  history: StoredHistoryEntry[];
}

// definitions

export type SimpleType = 'string' | 'number' | 'boolean';
export type ListType = string[] | number[] | boolean[];

export interface FieldSpec {
  name: string;
  type: any;
  default: any;
}

export interface DefinitionSpec {
  [key: string]: DefinitionSpec | FieldSpec;
}

export interface Definition {
  name: string;
  namespace: string;
  spec: DefinitionSpec;
}
