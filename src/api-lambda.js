/* eslint-disable import/first */
/* istanbul ignore file */
import awsServerlessExpress from 'aws-serverless-express';
import awsXRay from 'aws-xray-sdk';

// Capture all out-bound HTTP requests
awsXRay.captureHTTPsGlobal(require('http'));

import Api from './api';
import Constants from './configs/constants';

// Creates an express app (with parameter store)
const api = new Api()
  .use(awsXRay.express.openSegment(`${Constants.SERVICE_NAME}-${Constants.STAGE}-api`))
  .attachParameterStore()
  .attachApi()
  .attachErrorHandler()
  .use(awsXRay.express.closeSegment());

// Creates a AWS serverless express server
const server = awsServerlessExpress.createServer(api.express);

// eslint-disable-next-line import/prefer-default-export
export const handler = (event, context) => awsServerlessExpress.proxy(server, event, context);
