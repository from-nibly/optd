import { PutResource, Resource } from '../../types/root';

export const convertFromAPI = (record: Resource | PutResource) => {
  const { rev, name, ...restMeta } = record.metadata;
  return {
    _id: record.metadata.name,
    _rev: record.metadata.rev,
    metadata: {
      ...restMeta,
    },
    spec: record.spec,
    status: record.status,
  };
};

export const convertFromDatabase = (record: any): Resource => {
  return {
    metadata: Object.assign({}, record.metadata, {
      rev: record._rev,
      name: record._id.split('/')[1],
    }),
    history: record.history,
    spec: record.spec,
    status: record.status,
  };
};
