import PouchDB from 'pouchdb';

import express, { Request, Response } from 'express';
import { createDefinitionRouter } from './routes/definitions';
import { constructResourceDatabase } from './routes/resources/document';

const dbapp = require('express-pouchdb')({
  mode: 'minimumForPouchDB',
  overrideMode: {
    include: ['routes/fauxton'],
  },
});

const app = express();

const databases: Record<string, PouchDB.Database> = {};

const metaDB = new PouchDB('meta');

const definitionRouter = createDefinitionRouter(metaDB, databases, app);

app.use('/', definitionRouter);

metaDB
  .allDocs({
    startkey: 'type/',
    endkey: 'type/{}',
  })
  .then(async (docs) => {
    for (const doc of docs.rows) {
      console.log('found data type', doc.id);
      const friendlyName = doc.id.split('/')[1];
      const { name, db, router } = constructResourceDatabase(friendlyName);
      databases[name] = db;
      console.log('adding route', router);
      app.use(`/resources`, router);
    }
    console.log(app._router.stack);
  });

// when not specifying PouchDB as an argument to the main function, you
// need to specify it like this before requests are routed to ``app``
dbapp.setPouchDB(PouchDB);

console.log('starting sever');
dbapp.listen(3001);
app.listen(3000);
