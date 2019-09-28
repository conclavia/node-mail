/* istanbul ignore file */
// import cors from 'cors';
import express from 'express';
import Constants from './configs/constants';
import EmailController from './controllers/email-controller';
import HttpError from './errors/http-error';
import LogService from './services/log-service';
import ParameterStoreService from './services/parameter-store-service';

export default class Api {
  constructor() {
    this._express = express()
      .disable('x-powered-by')
      .use(LogService.middleware())
      .use(HttpError.middleware());
  }

  get express() {
    return this._express;
  }

  attachParameterStore() {
    this._express.use(ParameterStoreService.middleware(Constants.parameters));
    return this;
  }

  attachApi({ emailController = EmailController.middleware() } = {}) {
    this._express
      // Uncomment the next line to enable CORS
      // .use(cors())
      .use(express.json())
      .use([`/${Constants.SERVICE_PATH}/email`, '/email'], emailController);
    return this;
  }

  attachErrorHandler() {
    this._express.use(LogService.errorMiddleware());
    return this;
  }

  use(middleware) {
    this._express.use(middleware);
    return this;
  }
}
