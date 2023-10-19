import Express, { NextFunction, Request, Response, Router } from 'express';
import st from 'simple-runtypes';
import { isPouchDBError } from '../../types/pouchDB';
import { PutResourceSchema } from '../../types/root';
import { asyncHandler } from '../../util';
import { constructResourceDatabase } from '../namespaces/resources/api';
import { createKind } from './createKind';
import { convertFromDatabase } from './serialize';
import { updateKind } from './updateKind';

export const createDefinitionRouter = (
  meta: PouchDB.Database<{}>,
  databases: Record<string, PouchDB.Database>,
  app: Express.Express,
) => {
  const router = Router();

  router.put(
    '/kind/:kind',
    asyncHandler(async (req: Request, res: Response) => {
      const kind = req.params.kind;
      const putResource = PutResourceSchema(req.body);

      if (putResource.metadata.rev) {
        const updatedDocument = await updateKind(
          meta,
          putResource,
          'test user',
          'test message',
        );
        return res.json(updatedDocument);
      }

      const createdDocument = await createKind(
        meta,
        putResource,
        'test user',
        'test message',
      );

      const { db, name, router } = constructResourceDatabase(kind);
      app.use(`/namespaces`, router);

      databases[name] = db;

      res.json(createdDocument);
    }),
  );

  router.get(
    '/kind/:type',
    asyncHandler(async (req: Request, res: Response) => {
      const type = req.params.type;
      const existing = await meta.get(`kind/${type}`);

      res.json(convertFromDatabase(existing));
    }),
  );

  router.get(
    '/kind',
    asyncHandler(async (req: Request, res: Response) => {
      const type = req.params.type;
      const existing = await meta.allDocs({
        startkey: 'kind/',
        endkey: 'kind/{}',
        include_docs: true,
      });

      res.json({
        items: existing.rows.map((x) => x.doc).map(convertFromDatabase),
      });
    }),
  );

  router.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log('Endpoint Error', err);
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
