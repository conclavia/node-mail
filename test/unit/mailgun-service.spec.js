import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import request from 'request-promise-native';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import LogService from '../../src/services/log-service';
import MailgunService from '../../src/services/mailgun-service';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('services/mailgun-service', () => {
  before(() => {
    process.env.MAILGUN_API_BASE_URL = 'MAILGUN_API_BASE_URL';
    process.env.MAILGUN_API_DOMAIN = 'MAILGUN_API_DOMAIN';
    process.env.MAILGUN_API_KEY = 'MAILGUN_API_KEY';
  });

  after(() => {
    delete process.env.MAILGUN_API_BASE_URL;
    delete process.env.MAILGUN_API_DOMAIN;
    delete process.env.MAILGUN_API_KEY;
  });

  describe('constructor', () => {
    it('empty constructor should initialise default properties', () => {
      const service = new MailgunService();
      expect(service.log).to.be.instanceOf(LogService);
      expect(service.http).to.equal(request);
      expect(service.mailgunApiBaseUrl).to.be.equal(process.env.MAILGUN_API_BASE_URL);
      expect(service.mailgunApiDomain).to.be.equal(process.env.MAILGUN_API_DOMAIN);
      expect(service.mailgunApiKey).to.be.equal(process.env.MAILGUN_API_KEY);
    });
  });

  describe('send', () => {
    let service;

    beforeEach(() => {
      service = new MailgunService({
        log: { error: sinon.stub(), debug: sinon.stub() },
        http: sinon.stub(),
      });
    });

    it('undefined email should be rejected', () => expect(service.send()).to.be.rejectedWith(/"email" is required/));

    it('invalid email should be rejected', () => expect(service.send({})).to.be.rejectedWith(/"from" is required/));

    it('valid email should be sent', async () => {
      service.http.resolves({ id: 'id' });

      const email = { to: 'to', from: 'from', subject: 'subject', text: 'text' };
      const result = await service.send(email);

      expect(result).to.equal('id');
      expect(service.http).to.be.calledWith({
        method: 'POST',
        url: `${service.mailgunApiBaseUrl}/${service.mailgunApiDomain}/messages`,
        auth: {
          user: 'api',
          pass: service.mailgunApiKey,
        },
        headers: {
          'h:Reply-To': undefined,
        },
        form: email,
        json: true,
        timeout: 10 * 1000,
      });
    });

    it('send error should be rejected', async () => {
      service.http.throws({ error: { message: 'message' } });

      const email = { to: 'to', from: 'from', subject: 'subject', text: 'text' };

      await service
        .send(email)
        .then(() => expect.fail)
        .catch(error => expect(error.message).to.equal('message'));
      expect(service.http).to.be.called;
    });
  });
});
