export interface GlobalDBRecord {
  name: string;
  metadata_annotations: Record<string, string>;
  metadata_labels: Record<string, string>;
  status: Record<string, string>;
  state: string;
  spec: any;
  revision_id: string;
  revision_at: string;
  revision_by: string;
  revision_message?: string;
  revision_parent: string | null;
}

export interface NamespacedDBRecord extends GlobalDBRecord {
  namespace: string;
}
