import { Request, Response, Router } from 'express';
import PouchDB from 'pouchdb';
import { Resource } from '../../types/root';
import { PouchDBError, isPouchDBError } from '../../types/pouchDB';

interface ResourceDatabase<T extends {}> {
  name: string;
  db: PouchDB.Database<T>;
  router: Router;
}

export const constructResourceDatabase = <Spec, Status>(
  name: string,
): ResourceDatabase<Resource<Spec, Status>> => {
  const db = new PouchDB<Resource<Spec, Status>>('resources_' + name);

  const router = constructResourceRouter<Spec, Status>(name, db);

  return {
    name,
    db,
    router,
  };
};

export const constructResourceRouter = <Spec, Status>(
  name: string,
  db: PouchDB.Database<Resource<Spec, Status>>,
): Router => {
  const router = Router();

  router.get(`/:namespace/${name}`, async (req: Request, res: Response) => {
    const { namespace } = req.params;
    const records = await db.allDocs({
      startkey: `${namespace}/`,
      endkey: `${namespace}/{}`,
    });
    return res.json(records);
  });

  router.get(`/:namespace/${name}/:id`, async (req: Request, res: Response) => {
    const { namespace, id } = req.params;
    const records = await db.get(`${namespace}/${id}`).catch((e) => {
      res.json(e);
    });
    return res.json(records);
  });

  router.put(`/:namespace/${name}/:id`, async (req: Request, res: Response) => {
    const body = req.body as Resource<Spec, Status>;
    const id = req.params.id;
    const namespace = req.params.namespace;
    console.log('todo validate input', body);
    try {
      const response = await db.put({
        ...body,
        _id: `${namespace}/${id}`,
      });
      const resource = await db.get(response.id);
      res.json(resource);
    } catch (e) {
      if (isPouchDBError(e)) {
        if (e.status == 409) {
          return res.status(409).json({
            error: 'conflict',
            reason: 'Document with different revision already exists',
            status: 409,
          });
        }
        res.status(e.status ?? 500).json(e);
      } else {
        res.status(500).json(e);
      }
    }
  });
  return router;
};
