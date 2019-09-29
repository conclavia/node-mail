import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import request from 'request-promise-native';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import LogService from '../../src/services/log-service';
import SendgridService from '../../src/services/sendgrid-service';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('services/sendgrid-service', () => {
  before(() => {
    process.env.SENDGRID_API_BASE_URL = 'SENDGRID_API_BASE_URL';
    process.env.SENDGRID_API_KEY = 'SENDGRID_API_KEY';
  });

  after(() => {
    delete process.env.SENDGRID_API_BASE_URL;
    delete process.env.SENDGRID_API_KEY;
  });

  describe('constructor', () => {
    it('empty constructor should initialise default properties', () => {
      const service = new SendgridService();
      expect(service.log).to.be.instanceOf(LogService);
      expect(service.http).to.equal(request);
      expect(service.sendgridApiBaseUrl).to.be.equal(process.env.SENDGRID_API_BASE_URL);
      expect(service.sendgridApiKey).to.be.equal(process.env.SENDGRID_API_KEY);
    });
  });

  describe('send', () => {
    let service;

    beforeEach(() => {
      service = new SendgridService({
        log: { error: sinon.stub(), debug: sinon.stub() },
        http: sinon.stub(),
      });
    });

    it('undefined email should be rejected', () => expect(service.send()).to.be.rejectedWith(/"email" is required/));

    it('invalid email should be rejected', () => expect(service.send({})).to.be.rejectedWith(/"from" is required/));

    it('valid email should be sent', async () => {
      service.http.resolves({ headers: { 'x-message-id': 'id' } });

      const email = { to: 'to', cc: 'cc', bcc: 'bcc', from: 'from', subject: 'subject', text: 'text' };
      const result = await service.send(email);

      expect(result).to.equal('id');
      expect(service.http).to.be.calledWith({
        auth: { bearer: service.sendgridApiKey },
        body: {
          personalizations: [{ to: [{ email: email.to }], cc: [{ email: email.cc }], bcc: [{ email: email.bcc }] }],
          from: { email: email.from },
          reply_to: undefined,
          subject: email.subject,
          content: [{ type: 'text/plain', value: email.text }],
        },
        json: true,
        method: 'POST',
        resolveWithFullResponse: true,
        timeout: 10 * 1000,
        url: `${service.sendgridApiBaseUrl}/mail/send`,
      });
    });

    it('send error should be rejected', async () => {
      service.http.throws({ error: { errors: [{ message: 'message' }] } });
      const email = { to: 'to', from: 'from', subject: 'subject', text: 'text' };
      await service
        .send(email)
        .then(() => expect.fail)
        .catch(error => expect(error.message).to.equal('message'));
      expect(service.http).to.be.called;
    });
  });
});
