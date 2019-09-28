import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import express from 'express';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import supertest from 'supertest';
import EmailService from '../../src/services/email-service';
import EmailController from '../../src/controllers/email-controller';
import LogService from '../../src/services/log-service';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('controllers/email-controller', () => {
  before(() => {
    process.env.MAILGUN_API_BASE_URL = 'MAILGUN_API_BASE_URL';
    process.env.MAILGUN_API_DOMAIN = 'MAILGUN_API_DOMAIN';
    process.env.MAILGUN_API_KEY = 'MAILGUN_API_KEY';
    process.env.SENDGRID_API_BASE_URL = 'SENDGRID_API_BASE_URL';
    process.env.SENDGRID_API_KEY = 'SENDGRID_API_KEY';
  });

  after(() => {
    delete process.env.MAILGUN_API_BASE_URL;
    delete process.env.MAILGUN_API_DOMAIN;
    delete process.env.MAILGUN_API_KEY;
    delete process.env.SENDGRID_API_BASE_URL;
    delete process.env.SENDGRID_API_KEY;
  });

  describe('constructor', () => {
    it('empty constructor should initialise default properties', () => {
      const controller = new EmailController();
      expect(controller.log).to.be.instanceOf(LogService);
      expect(controller.emailService).to.be.instanceOf(EmailService);
      expect(controller.emailService.log).to.equal(controller.log);
    });
  });

  describe('middleware', () => {
    it('POST / should call controller.send', () => {
      const controller = { send: sinon.stub().callsFake((req, res) => res.end()) };
      const app = express().use(EmailController.middleware(controller));
      return supertest(app)
        .post('/')
        .then(() => {
          expect(controller.send).to.be.calledOnce;
        });
    });
  });

  describe('send', () => {
    const stubController = () =>
      new EmailController({
        log: { error: sinon.stub() },
        emailService: { send: sinon.stub() },
      });
    const stubRes = () => ({
      json: sinon.stub().returnsThis(),
      jsonError: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis(),
    });

    it('invalid request body should return error', async () => {
      const controller = stubController();
      const res = stubRes();
      await controller.send({}, res);
      expect(res.jsonError).to.be.called;
      expect(res.jsonError.args[0][0].message).to.contain('"body" is required');
    });

    it('valid request should return response', async () => {
      const controller = stubController();
      const req = { body: { data: { type: 'email', attributes: { to: 'user@example.com' } } }, headers: {} };
      const res = stubRes();

      controller.emailService.send.resolves({ id: 'id', sender: 'mailgun' });

      await controller.send(req, res);
      expect(controller.emailService.send).to.be.calledWith(req.body.data.attributes, 'mailgun', false);
      expect(res.status).to.be.calledWith(202);
      expect(res.json).to.be.calledWith({
        data: {
          id: 'id',
          type: 'email-response',
          attributes: { sender: 'mailgun' },
        },
      });
    });

    it('failed request should return error', async () => {
      const controller = stubController();
      const req = { body: { data: { type: 'email', attributes: { to: 'user@example.com' } } }, headers: {} };
      const res = stubRes();
      const error = new Error();

      controller.emailService.send.throws(error);

      await controller.send(req, res);
      expect(res.jsonError).to.be.calledWith(error);
      expect(res.status).to.not.be.called;
    });
  });
});
