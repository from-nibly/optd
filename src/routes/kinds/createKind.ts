import { PutResource, Resource } from '../../types/root';
import { generateHistory } from '../namespaces/resources/serialize';
import { convertFromAPI, convertFromDatabase } from './serialize';

export const createKind = async (
  db: PouchDB.Database,
  kind: PutResource,
  user: string,
  message: string,
): Promise<Resource> => {
  const record = convertFromAPI(kind);
  console.log('creating resource', record);
  const newRecord = {
    ...record,
    history: generateHistory(user, message, null),
  };
  const result = await db.put(newRecord);
  const stored = await db.get(result.id);
  return convertFromDatabase(stored);
};
