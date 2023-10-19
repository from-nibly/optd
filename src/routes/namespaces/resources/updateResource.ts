import { historyID } from '../../../types/ids';
import { isPouchDBError } from '../../../types/pouchDB';
import { PutResource, Resource, StoredResource } from '../../../types/root';
import {
  convertFromAPI,
  convertFromDatabase,
  generateHistory,
} from './serialize';

export const updateResource = async (
  db: PouchDB.Database,
  namespace: string,
  resource: PutResource,
  user: string,
  message: string,
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
    const histID = res.id;

    const newDocument = {
      ...document,
      history: generateHistory(user, message, histID),
    };
    const resourceResult = await db.put(newDocument);
    return convertFromDatabase(await db.get(resourceResult.id));
  } catch (e) {
    if (isPouchDBError(e) && e.status == 409) {
      if (historyRev && e.docId !== history._id) {
        db.remove({ _id: history._id, _rev: historyRev });
        console.log('conflict', e);
        throw e;
      }
    }
    console.log('unkonwn error', e);
    throw e;
  }
};
