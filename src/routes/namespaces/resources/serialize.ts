import { partsFromResourceID, resourceID } from '../../../types/ids';
import { PutResource, Resource } from '../../../types/root';

export const convertFromAPI = (
  namespace: string,
  record: Resource | PutResource,
) => {
  const { rev, name, ...restMeta } = record.metadata;
  return {
    _id: resourceID(namespace, record.metadata.name),
    _rev: record.metadata.rev,
    metadata: restMeta,
    spec: record.spec,
    status: record.status,
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
) => ({
  by: user,
  at: new Date(),
  message,
  parent: parentID,
});
