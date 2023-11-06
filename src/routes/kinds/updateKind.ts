import { historyKindID } from '../../types/ids';
import { isPouchDBError } from '../../types/pouchDB';
import { PutResource, StoredResource } from '../../types/root';
import { generateHistory } from '../namespaces/resources/serialize';
import { convertFromAPI, convertFromDatabase } from './serialize';

export const updateKind = async (
  db: PouchDB.Database,
  kind: PutResource,
  user: string,
  message: string,
) => {
  const document = convertFromAPI(kind);
  const existing: StoredResource = await db.get(document._id);
  const { _rev, ...restExisting } = existing;

  const history = {
    ...restExisting,
    _id: historyKindID(kind.metadata.name, _rev),
  };

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
        console.log('removing history file');
        db.remove({ _id: history._id, _rev: historyRev });
        console.log('conflict', e);
        throw e;
      }
    }
    console.log('unkonwn error', e);
    throw e;
  }
};
