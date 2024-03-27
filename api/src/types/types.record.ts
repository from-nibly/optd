export interface DBRecord {
  name: string;
  namespace: string;
  annotations: Record<string, string>;
  labels: Record<string, string>;
  status: Record<string, string>;
  state: string;
  spec: any;
  revision_id: string;
  revision_at: string;
  revision_by: string;
  revision_message?: string;
}

export interface DBRecordHistory extends DBRecord {
  revision_parent: string;
}
