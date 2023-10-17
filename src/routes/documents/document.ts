import { Request, Response, Router } from 'express';
import PouchDB from 'pouchdb';

export const createDocumentRouter = <Content extends {}>(
  name: string,
  db: PouchDB.Database<Content>,
) => {
  const router = Router();

  router.get(`/:namespace/${name}`, (req: Request, res: Response) => {
    db.allDocs({
      startkey: `${req.params.namespace}/${name}/`,
      endkey: `${req.params.namespace}/${name}/{}`,
    });
  });
};
