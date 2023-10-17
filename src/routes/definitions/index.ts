import Express, { Request, Response, Router } from 'express';
import { constructResourceDatabase } from '../resources/document';

export const createDefinitionRouter = (
  meta: PouchDB.Database<{}>,
  databases: Record<string, PouchDB.Database>,
  app: Express.Express,
) => {
  const router = Router();

  router.put('/meta/type/:type', async (req: Request, res: Response) => {
    const type = req.params.type;
    const existing = await meta.get(`type/${type}`).catch(() => null);
    const result = await meta.put({
      _id: `type/${type}`,
      _rev: existing?._rev ?? undefined,
    });

    const { db, name, router } = constructResourceDatabase(type);
    app.use(`/resources/${name}`, router);

    databases[name] = db;
    res.json(result);
  });
  return router;
};
