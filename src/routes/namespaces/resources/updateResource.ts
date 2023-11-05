import { HookRunner } from '../../../hooks/runner';
import { historyID } from '../../../types/ids';
import { PutResource, Resource, StoredResource } from '../../../types/root';
import {
  convertFromAPI,
  convertFromDatabase,
  generateHistory,
} from './serialize';

export const updateResource = async (
  db: PouchDB.Database,
  hookRunner: HookRunner,
  namespace: string,
  resource: PutResource,
  user: string,
  message: string,
  kind: string,
): Promise<Resource> => {
  const document = convertFromAPI(namespace, resource);
  const existing: StoredResource = await db.get(document._id);
  const { _rev, ...restExisting } = existing;

  const history = {
    ...restExisting,
    _id: historyID(namespace, resource.metadata.name, _rev),
  };
  // first create the history record, then update the document to point to the latest history document.
  // then always clean up any history that doesn't chain to the latest history document
  let historyRev: string | undefined;
  try {
    const res = await db.put(history);
    historyRev = res.rev;

    await hookRunner.executeHook('preUpdate', kind, document);
    const histID = res.id;

    const newDocument = {
      ...document,
      history: generateHistory(user, message, histID),
    };
    const resourceResult = await db.put(newDocument);
    await hookRunner.executeHook('postUpdate', kind, document);
    return convertFromDatabase(await db.get(resourceResult.id));
  } catch (e) {
    //TODO: validate this
    console.log('caught error', historyRev, e);
    if (historyRev) {
      db.remove({ _id: history._id, _rev: historyRev });
      console.log('conflict', e);
      throw e;
    }
    console.log('unkonwn error', e);
    throw e;
  }
};
