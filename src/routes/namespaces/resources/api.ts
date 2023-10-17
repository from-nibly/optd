import { Handler, NextFunction, Request, Response, Router } from 'express';
import PouchDB from 'pouchdb';
import st from 'simple-runtypes';
import { resourceID } from '../../../types/ids';
import { isPouchDBError } from '../../../types/pouchDB';
import { PutResource, PutResourceSchema, Resource } from '../../../types/root';
import { convertFromAPI, convertFromDatabase } from './serialize';
import { updateResource } from './updateResource';
import { createResource } from './createResource';

interface ResourceDatabase<T extends {}> {
  name: string;
  db: PouchDB.Database<T>;
  router: Router;
}

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
        startkey: `ns/${namespace}/`,
        endkey: `ns/${namespace}/{}`,
        include_docs: true,
      });
      return res.json(records.rows.map((r) => convertFromDatabase(r.doc)));
    }),
  );

  router.get(
    `/:namespace/${resourceTypeName}/:name`,
    asyncHandler(async (req: Request, res: Response) => {
      const { namespace, name } = req.params;
      const record = await db.get(resourceID(namespace, name)).catch((e) => {
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
      if (putDocument.metadata.rev) {
        const updatedDocument = await updateResource(
          db,
          namespace,
          putDocument,
          //TODO: take message as query param?
          'test user',
          'test message',
        );
        return res.json(updatedDocument);
      }

      const createdDocument = await createResource(
        db,
        namespace,
        putDocument,
        //TODO: take message as query param?
        'test user',
        'test message',
      );
      return res.json(createdDocument);
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
    console.log('handling error', err);
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
