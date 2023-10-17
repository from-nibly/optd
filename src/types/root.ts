import st from 'simple-runtypes';

export const SubjectSchema = st.record({
  uid: st.string(),
  name: st.string(),
});

export type Subject = ReturnType<typeof SubjectSchema>;

export const HistoryDataSchema = st.record({
  by: st.record(SubjectSchema),
  at: st.string(),
  message: st.optional(st.string()),
  parent: st.optional(st.string()),
});

export type HistoryData = ReturnType<typeof HistoryDataSchema>;

export const PutResourceMetaSchema = st.record({
  name: st.string(),
  labels: st.optional(st.dictionary(st.string(), st.string())),
  rev: st.optional(st.string()),
});

export type PutResourceMeta = ReturnType<typeof PutResourceMetaSchema>;

export const ResourceMetaSchema = st.record({
  namespace: st.string(),
  name: st.string(),
  labels: st.dictionary(st.string(), st.string()),
  rev: st.string(),
});

export type ResourceMeta = ReturnType<typeof ResourceMetaSchema>;

export const PutResourceSchema = st.record({
  metadata: PutResourceMetaSchema,
  spec: st.any(),
  status: st.any(),
});

export type PutResource = ReturnType<typeof PutResourceSchema>;

export const StoredResourceSchema = st.record({
  _id: st.string(),
  _rev: st.string(),
  metadata: ResourceMetaSchema,
  spec: st.any(),
  status: st.any(),
  history: HistoryDataSchema,
});

export type StoredResource = ReturnType<typeof StoredResourceSchema>;

export const ResourceSchema = st.record({
  metadata: ResourceMetaSchema,
  history: HistoryDataSchema,
  spec: st.any(),
  status: st.any(),
});

export type Resource = ReturnType<typeof ResourceSchema>;
