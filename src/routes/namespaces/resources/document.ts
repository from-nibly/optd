import { Request, Response, Router } from 'express';
import PouchDB from 'pouchdb';
import { PutResourceSchema, StoredResource } from '../../../types/root';
import { PouchDBError, isPouchDBError } from '../../../types/pouchDB';
import st from 'simple-runtypes';

interface ResourceDatabase<T extends {}> {
  name: string;
  db: PouchDB.Database<T>;
  router: Router;
}

export const constructResourceDatabase = <Spec, Status>(
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

const convertFromDatabase = (record: any) => {
  return {
    metadata: Object.assign({}, record.metadata, {
      namespace: record._id.split('/')[0],
      name: record._id.split('/')[1],
      rev: record._rev,
    }),
    spec: record.spec,
    status: record.status,
  };
};

export const constructResourceRouter = (
  resourceTypeName: string,
  db: PouchDB.Database<any>,
): Router => {
  const router = Router();

  router.get(
    `/:namespace/${resourceTypeName}/`,
    async (req: Request, res: Response) => {
      const { namespace } = req.params;
      const records = await db.allDocs({
        startkey: `${namespace}/`,
        endkey: `${namespace}/{}`,
        include_docs: true,
      });
      return res.json(records.rows.map((r) => convertFromDatabase(r.doc)));
    },
  );

  router.get(
    `/:namespace/${resourceTypeName}/:id`,
    async (req: Request, res: Response) => {
      const { namespace, id } = req.params;
      const record = await db.get(`${namespace}/${id}`).catch((e) => {
        res.json(e);
      });
      return res.json(convertFromDatabase(record));
    },
  );
  //TODO: revision history with ownership
  //TODO: document id should be /rev/:namespace/:name/:rev
  //TODO: documents need a transformer that converts to from database format to api format

  router.put(
    `/:namespace/${resourceTypeName}`,
    async (req: Request, res: Response) => {
      const namespace = req.params.namespace;
      const { rev, name, ...metadata } = req.body.metadata;

      try {
        const body = PutResourceSchema(req.body);
        const record = {
          _id: `${namespace}/${name}`,
          _rev: body.metadata.rev,
          metadata: metadata,
          spec: body.spec,
          status: body.status,
        };
        const response = await db.put(record);
        const resource = await db.get(response.id);
        return res.json(resource);
      } catch (e) {
        if (e instanceof st.RuntypeError) {
          res.status(400).json(e);
        } else if (isPouchDBError(e)) {
          if (e.status == 409) {
            return res.status(409).json({
              error: 'conflict',
              reason:
                'Update happened after reading current document, please try again',
              status: 409,
            });
          }
          res.status(e.status ?? 500).json(e);
        } else {
          res.status(500).json(e);
        }
      }
    },
  );

  router.delete(
    `/:namespace/${resourceTypeName}/:id`,
    async (req: Request, res: Response) => {
      console.log('testing');
      const record = await db.get(`${req.params.namespace}/${req.params.id}`);
      db.remove({ _id: record._id, _rev: record._rev });
      res.status(200);
    },
  );
  return router;
};
