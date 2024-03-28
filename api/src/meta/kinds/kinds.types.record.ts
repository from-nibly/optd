import { GlobalDBRecord } from 'src/types/types.record';
import { CreateKind, KindSpec, UpdateKind } from './kinds.types';
import { v4 as uuid } from 'uuid';
import { UserContext } from 'src/types/types';

export interface KindDBRecord extends GlobalDBRecord {
  spec: KindSpec;
}

export function fromCreateRecord(
  create: CreateKind,
  actor: UserContext,
  message?: string,
): KindDBRecord {
  return {
    name: create.metadata.name,
    metadata_annotations: create.metadata.annotations ?? {},
    metadata_labels: create.metadata.labels ?? {},
    status: create.status ?? {},
    state: create.state,
    spec: create.spec,
    revision_id: uuid(),
    revision_at: new Date().toISOString(),
    revision_by: actor.username,
    revision_message: message,
    revision_parent: null,
  };
}

export function fromUpdateRecord(
  update: UpdateKind,
  actor: UserContext,
  parent_revision: string,
  message: string | undefined,
): KindDBRecord {
  return {
    name: update.metadata.name,
    metadata_annotations: update.metadata.annotations,
    metadata_labels: update.metadata.labels,
    status: update.status,
    state: update.state,
    spec: update.spec,
    revision_id: uuid(),
    revision_at: new Date().toISOString(),
    revision_by: actor.username,
    revision_message: message,
    revision_parent: parent_revision,
  };
}
