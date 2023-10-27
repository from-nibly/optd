import st from 'simple-runtypes';
import {
  HistoryDataSchema,
  PutResourceMetaSchema,
  ResourceMetaSchema,
} from './root';

/* -------------------------------- HookSpec -------------------------------- */
export const HookSpecSchema = st.record({
  postCreate: st.optional(st.string()),
  validate: st.optional(st.string()),
  postUpdate: st.optional(st.string()),
  preUpdate: st.optional(st.string()),
});

export type HookSpec = ReturnType<typeof HookSpecSchema>;

/* -------------------------------- KindSpec -------------------------------- */
export const KindSpecSchema = st.record({
  hooks: HookSpecSchema,
});

export type KindSpec = ReturnType<typeof KindSpecSchema>;

/* --------------------------------- PutKind -------------------------------- */

export const PutKindSchema = st.record({
  metadata: PutResourceMetaSchema,
  spec: KindSpecSchema,
  status: st.any(),
});

export type PutKind = ReturnType<typeof PutKindSchema>;

/* ---------------------------------- Kind ---------------------------------- */

export const KindSchema = st.record({
  metadata: ResourceMetaSchema,
  history: HistoryDataSchema,
  spec: KindSpecSchema,
  status: st.any(),
});

export type Kind = ReturnType<typeof KindSchema>;
