import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import EmailService from '../../src/services/email-service';
import LogService from '../../src/services/log-service';
import MailgunService from '../../src/services/mailgun-service';
import SendgridService from '../../src/services/sendgrid-service';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('services/email-service', () => {
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
      const service = new EmailService();
      expect(service.log).to.be.instanceOf(LogService);
      expect(service.mailgunService).to.be.instanceOf(MailgunService);
      expect(service.sendgridService).to.be.instanceOf(SendgridService);
    });
  });

  describe('send', () => {
    let service;

    beforeEach(() => {
      service = new EmailService({
        log: { error: sinon.stub() },
        mailgunService: { send: sinon.stub() },
        sendgridService: { send: sinon.stub() },
      });
    });

    it('undefined email should be rejected', () => expect(service.send()).to.be.rejectedWith(/"email" is required/));

    it('invalid email should be rejected', () => expect(service.send({})).to.be.rejectedWith(/"from" is required/));

    it('invalid preferSender should be rejected', () =>
      expect(service.send({ to: 'to', from: 'from', subject: 'subject', text: 'text' }, 'sender')).to.be.rejectedWith(
        /"preferSender" must be one of \[mailgun, sendgrid\]/,
      ));

    it('invalid noFallback should be rejected', () =>
      expect(
        service.send({ to: 'to', from: 'from', subject: 'subject', text: 'text' }, 'mailgun', null),
      ).to.be.rejectedWith(/"noFallback" must be a boolean/));

    it('valid email should be sent', async () => {
      service.mailgunService.send.resolves('id');

      const result = await service.send({ to: 'to', from: 'from', subject: 'subject', text: 'text' });
      expect(result).to.eql({ id: 'id', sender: 'mailgun' });
      expect(service.mailgunService.send).to.be.calledWithMatch({
        to: 'to',
        from: 'from',
        subject: 'subject',
        text: 'text',
      });
      expect(service.sendgridService.send).to.not.be.called;
    });

    it('send error should call fallback sender', async () => {
      service.mailgunService.send.throws();
      service.sendgridService.send.resolves('id');

      const result = await service.send({ to: 'to', from: 'from', subject: 'subject', text: 'text' }, 'mailgun');
      expect(result).to.eql({ id: 'id', sender: 'sendgrid' });
      expect(service.mailgunService.send).to.be.called;
      expect(service.sendgridService.send).to.be.calledWithMatch({
        to: 'to',
        from: 'from',
        subject: 'subject',
        text: 'text',
      });
    });

    it('skip fallback should not call fallback sender', async () => {
      service.mailgunService.send.throws();

      await expect(service.send({ to: 'to', from: 'from', subject: 'subject', text: 'text' }, 'mailgun', true)).to.be
        .rejected;
      expect(service.mailgunService.send).to.be.called;
      expect(service.sendgridService.send).to.not.be.called;
    });

    it('preferred sender should be used first', async () => {
      await service.send({ to: 'to', from: 'from', subject: 'subject', text: 'text' }, 'sendgrid');
      expect(service.sendgridService.send).to.be.called;
      expect(service.mailgunService.send).to.not.be.called;
    });
  });
});
