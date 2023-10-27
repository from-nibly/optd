import { HookRunner } from '../../../hooks/runner';
import { CreateResource, PutResource, Resource } from '../../../types/root';
import {
  convertFromAPI,
  convertFromDatabase,
  generateHistory,
} from './serialize';

export const createResource = async (
  db: PouchDB.Database,
  hookRunner: HookRunner,
  namespace: string,
  resource: PutResource,
  user: string,
  message: string,
  kind: string,
): Promise<Resource> => {
  const toCreateResource: CreateResource = {
    ...resource,
    metadata: {
      ...resource.metadata,
      labels: resource.metadata.labels ?? {},
      kind,
      namespace,
    },
    history: generateHistory(user, message, null),
  };

  const document = convertFromAPI(namespace, toCreateResource);

  const newRecord = {
    ...document,
  };

  const result = await db.put(newRecord);
  const stored = await db.get(result.id);
  const newResource = convertFromDatabase(stored);
  await hookRunner.executeHook('postCreate', kind, newResource);
  return newResource;
};
