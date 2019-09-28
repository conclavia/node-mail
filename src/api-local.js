/* istanbul ignore file */
import express from 'express';
import fs from 'fs';
import https from 'https';
import Api from './api';
import apiDocs from './api-docs';
import Constants from './configs/constants';

// Create an express app (without parameter store)
const api = new Api().attachApi().attachErrorHandler().express;

https
  // Attach a self-signed certificate for https
  .createServer(
    {
      pfx: fs.readFileSync('internals/localhost.pfx'),
      passphrase: 'localhost',
    },
    express()
      .use(apiDocs)
      .use(api),
  )
  .listen(3000, () => {
    /* eslint-disable no-console */
    console.log(`API started on ${Constants.SERVICE_HOST}`);
    console.log(`API docs started on ${Constants.SERVICE_HOST}/docs/`);
    /* eslint-enable no-console */
  });
