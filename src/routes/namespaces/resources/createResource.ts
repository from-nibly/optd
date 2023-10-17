import { PutResource, Resource } from '../../../types/root';
import {
  convertFromAPI,
  convertFromDatabase,
  generateHistory,
} from './serialize';

export const createResource = async (
  db: PouchDB.Database,
  namespace: string,
  resource: PutResource,
  user: string,
  message: string,
): Promise<Resource> => {
  const record = convertFromAPI(namespace, resource);
  console.log('creating resource', record);
  const newRecord = {
    ...record,
    history: generateHistory(user, message, null),
  };
  const result = await db.put(newRecord);
  const stored = await db.get(result.id);
  return convertFromDatabase(stored);
};
