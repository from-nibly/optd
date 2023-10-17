import PouchDB from 'pouchdb';

import express, { Request, Response } from 'express';
import { createDocumentRouter } from './routes/definitions';

const dbapp = require('express-pouchdb')({
  mode: 'minimumForPouchDB',
  overrideMode: {
    include: ['routes/fauxton'],
  },
});

const app = express();

const metaDB = new PouchDB('meta');

const definitionRouter = createDocumentRouter(metaDB);

app.use('/', definitionRouter);

// when not specifying PouchDB as an argument to the main function, you
// need to specify it like this before requests are routed to ``app``
dbapp.setPouchDB(PouchDB);

console.log('starting sever');
dbapp.listen(3001);
app.listen(3000);
