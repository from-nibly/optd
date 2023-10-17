import { Handler, NextFunction, Request, Response, Router } from 'express';
import PouchDB from 'pouchdb';
import {
  PutResource,
  PutResourceSchema,
  Resource,
  StoredResource,
} from '../../../types/root';
import { PouchDBError, isPouchDBError } from '../../../types/pouchDB';
import st from 'simple-runtypes';

interface ResourceDatabase<T extends {}> {
  name: string;
  db: PouchDB.Database<T>;
  router: Router;
}

const convertFromAPI = (namespace: string, record: Resource | PutResource) => {
  const { rev, ...restMeta } = record.metadata;
  console.log('removing rev', restMeta);
  return {
    _id: `${namespace}/${record.metadata.name}`,
    _rev: record.metadata.rev,
    metadata: restMeta,
    spec: record.spec,
    status: record.status,
  };
};

const convertFromDatabase = (record: any): Resource => {
  return {
    metadata: Object.assign({}, record.metadata, {
      namespace: record._id.split('/')[0],
      name: record._id.split('/')[1],
      rev: record._rev,
    }),
    history: record.history,
    spec: record.spec,
    status: record.status,
  };
};

const CreateResource = async (
  db: PouchDB.Database,
  namespace: string,
  resource: PutResource,
): Promise<Resource> => {
  const record = convertFromAPI(namespace, resource);
  const result = await db.put(record);
  const stored = await db.get(result.id);
  return convertFromDatabase(stored);
};

const updateResource = async (
  db: PouchDB.Database,
  namespace: string,
  resource: PutResource,
): Promise<Resource> => {
  const record = convertFromAPI(namespace, resource);
  const existing: StoredResource = await db.get(record._id);
  const { _rev, ...restExisting } = existing;
  const history = {
    ...restExisting,
    _id: `hist/${existing._id}/${existing._rev}`,
  };
  //TODO: make this effectively a transaction...somehow
  // first create the history record, then update the document to point to the latest history document.
  // then always clean up any history that doesn't chain to the latest history document
  let historyRev: string | undefined;
  try {
    const historyResult = await db.put(history);
    historyRev = historyResult.rev;
    const newRecord = {
      ...record,
      history: {
        by: 'testing',
        at: new Date(),
        message: 'string',
        parent: historyResult.id,
      },
    };
    console.log('putting new record', record);
    const resourceResult = await db.put(newRecord);
    return convertFromDatabase(await db.get(resourceResult.id));
  } catch (e) {
    if (isPouchDBError(e) && e.status == 409) {
      if (historyRev && e.docId !== history._id) {
        db.remove({ _id: history._id, _rev: historyRev });
        throw e;
      }
    }
    throw e;
  }
};

export const constructResourceDatabase = (
  name: string,
): ResourceDatabase<any> => {
  const db = new PouchDB<any>('resources_' + name);

  const router = constructResourceRouter(name, db);

  return {
    name,
    db,
    router,
  };
};

//TODO: add history endpoints
const asyncHandler =
  (fn: Handler) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

export const constructResourceRouter = (
  resourceTypeName: string,
  db: PouchDB.Database<any>,
): Router => {
  const router = Router();

  router.get(
    `/:namespace/${resourceTypeName}/`,
    asyncHandler(async (req: Request, res: Response) => {
      const { namespace } = req.params;
      const records = await db.allDocs({
        startkey: `${namespace}/`,
        endkey: `${namespace}/{}`,
        include_docs: true,
      });
      return res.json(records.rows.map((r) => convertFromDatabase(r.doc)));
    }),
  );

  router.get(
    `/:namespace/${resourceTypeName}/:id`,
    asyncHandler(async (req: Request, res: Response) => {
      const { namespace, id } = req.params;
      const record = await db.get(`${namespace}/${id}`).catch((e) => {
        res.json(e);
      });
      return res.json(convertFromDatabase(record));
    }),
  );
  //TODO: revision history with ownership
  //TODO: documents need a transformer that converts to from database format to api format

  router.put(
    `/:namespace/${resourceTypeName}`,
    asyncHandler(async (req: Request, res: Response) => {
      const putDocument = await PutResourceSchema(req.body);
      const namespace = req.params.namespace;
      const updatedDocument = await updateResource(db, namespace, req.body);
      return res.json(updatedDocument);
    }),
  );

  router.delete(
    `/:namespace/${resourceTypeName}/:id`,
    asyncHandler(async (req: Request, res: Response) => {
      const record = await db.get(`${req.params.namespace}/${req.params.id}`);
      db.remove({ _id: record._id, _rev: record._rev });
      res.status(200);
    }),
  );

  router.use((err: any, req: Request, res: Response, next: NextFunction) => {
    next;
    if (err instanceof st.RuntypeError) {
      res.status(400).json(err);
    } else if (isPouchDBError(err)) {
      if (err.status == 409) {
        return res.status(409).json({
          error: 'conflict',
          reason:
            'Update happened after reading current document, please try again',
          status: 409,
        });
      }
      res.status(err.status ?? 500).json(err);
    } else {
      //TODO: probably just return a big shrug instead of internal code
      res.status(500).json(err);
    }
  });

  return router;
};
