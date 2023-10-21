import PouchDB from 'pouchdb';

import express, { Request, Response } from 'express';
import { createDefinitionRouter } from './routes/kinds/api';
import { constructResourceDatabase } from './routes/namespaces/resources/api';
import bodyParser from 'body-parser';
import { HookRunner } from './hooks/runner';
import { Kind } from './types/kinds';

const dbapp = require('express-pouchdb')({
  mode: 'minimumForPouchDB',
  overrideMode: {
    include: ['routes/fauxton'],
  },
});

const app = express();

app.use(bodyParser.json());

const databases: Record<string, PouchDB.Database> = {};

const metaDB = new PouchDB<Kind>('meta');

const hookRunner = new HookRunner();

const definitionRouter = createDefinitionRouter(
  metaDB,
  databases,
  app,
  hookRunner,
);

app.use('/meta', definitionRouter);

metaDB
  .allDocs({
    startkey: 'kind/',
    endkey: 'kind/{}',
    include_docs: true,
  })
  .then(async (docs) => {
    for (const doc of docs.rows) {
      const friendlyName = doc.id.split('/')[1];
      const { name, db, router } = constructResourceDatabase(
        friendlyName,
        hookRunner,
      );
      hookRunner.configureHooks(friendlyName, doc.doc!.spec?.hooks);
      databases[name] = db;
      app.use(`/namespaces`, router);
    }
  });

// when not specifying PouchDB as an argument to the main function, you
// need to specify it like this before requests are routed to ``app``
dbapp.setPouchDB(PouchDB);

console.log('starting sever');
dbapp.listen(3001);
app.listen(3000);
