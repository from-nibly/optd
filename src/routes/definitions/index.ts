import { Request, Response, Router } from 'express';

export const createDocumentRouter = (db: PouchDB.Database<{}>) => {
  const router = Router();

  router.put('/meta/type/:type', async (req: Request, res: Response) => {
    const type = req.params.type;
    const existing = await db.get(`type/${type}`).catch(() => null);
    const result = await db.put({
      _id: `type/${type}`,
      _rev: existing?._rev ?? undefined,
    });
    res.json(result);
  });
  return router;
};
