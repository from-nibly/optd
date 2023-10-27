import st from 'simple-runtypes';

/* --------------------------------- Subject -------------------------------- */

export const SubjectSchema = st.record({
  uid: st.string(),
  name: st.string(),
});

export type Subject = ReturnType<typeof SubjectSchema>;

/* ------------------------------- HistoryData ------------------------------ */

export const HistoryDataSchema = st.record({
  by: st.record(SubjectSchema),
  at: st.string(),
  message: st.optional(st.string()),
  parent: st.nullOr(st.string()),
});

export type HistoryData = ReturnType<typeof HistoryDataSchema>;

/* ----------------------------- PutResourceMeta ---------------------------- */

export const PutResourceMetaSchema = st.record({
  name: st.string(),
  labels: st.optional(st.dictionary(st.string(), st.string())),
  rev: st.optional(st.string()),
});

export type PutResourceMeta = ReturnType<typeof PutResourceMetaSchema>;

export const CreateResourceMetaSchema = st.record({
  namespace: st.string(),
  name: st.string(),
  labels: st.dictionary(st.string(), st.string()),
  kind: st.string(),
});

export type CreateResourceMeta = ReturnType<typeof CreateResourceMetaSchema>;

/* ------------------------------ ResourceMeta ------------------------------ */

export const ResourceMetaSchema = st.intersection(
  st.record({
    rev: st.string(),
  }),
  CreateResourceMetaSchema,
);

export type ResourceMeta = ReturnType<typeof ResourceMetaSchema>;

/* ------------------------------- PutResource ------------------------------ */

export const PutResourceSchema = st.record({
  metadata: PutResourceMetaSchema,
  spec: st.any(),
  status: st.any(),
});

export type PutResource = ReturnType<typeof PutResourceSchema>;

/* ----------------------------- StoredResource ----------------------------- */

export const StoredResourceSchema = st.record({
  _id: st.string(),
  _rev: st.string(),
  metadata: st.omit(ResourceMetaSchema, 'rev', 'name'),
  spec: st.any(),
  status: st.any(),
  history: HistoryDataSchema,
});

export type StoredResource = ReturnType<typeof StoredResourceSchema>;

/* ----------------------------- Create Resource ---------------------------- */

export const CreateResourceSchema = st.record({
  metadata: CreateResourceMetaSchema,
  history: HistoryDataSchema,
  spec: st.any(),
  status: st.any(),
});

export type CreateResource = ReturnType<typeof CreateResourceSchema>;

/* -------------------------------- Resource; ------------------------------- */

export const ResourceSchema = st.record({
  metadata: ResourceMetaSchema,
  history: HistoryDataSchema,
  spec: st.any(),
  status: st.any(),
});

export type Resource = ReturnType<typeof ResourceSchema>;
