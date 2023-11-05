import { partsFromResourceID, resourceID } from '../../../types/ids';
import { HistoryData, Resource, StoredResource } from '../../../types/root';

//TODO: there are multiple forms of Stored Documents. to create, to update, and stored.
export const convertFromAPI = (
  namespace: string,
  //TODO: this seems fishy
  record: any,
): StoredResource => {
  console.log('testing', record);
  const { rev, name, ...restMeta } = record.metadata;
  return {
    _id: resourceID(namespace, record.metadata.name),
    _rev: record.metadata.rev,
    metadata: {
      ...restMeta,
      namespace,
    },
    spec: record.spec,
    status: record.status,
    history: record.history,
  };
};

export const convertFromDatabase = (record: any): Resource => {
  const { namespace, name } = partsFromResourceID(record._id);
  return {
    metadata: Object.assign({}, record.metadata, {
      namespace,
      name,
      rev: record._rev,
    }),
    history: record.history,
    spec: record.spec,
    status: record.status,
  };
};

export const generateHistory = (
  user: string,
  message: string,
  parentID: string | null,
): HistoryData => ({
  by: user,
  at: new Date().toISOString(),
  message,
  parent: parentID,
});
