import joi from 'joi';
import Email from '../models/email-model';
import LogService from './log-service';
import MailgunService from './mailgun-service';
import SendgridService from './sendgrid-service';

export default class EmailService {
  constructor({
    log = new LogService(),
    mailgunService = new MailgunService({ log }),
    sendgridService = new SendgridService({ log }),
  } = {}) {
    this.log = log;
    this.mailgunService = mailgunService;
    this.sendgridService = sendgridService;
  }

  async send(email, preferSender = 'mailgun', noFallback = false) {
    joi.assert(email, Email.constraints.label('email').required());

    try {
      const sender = this.getSender(preferSender);
      const id = await sender.send(email);
      return { id, sender: preferSender };
    } catch (error) {
      if (noFallback) throw error;

      const fallbackSender = preferSender === 'mailgun' ? 'sendgrid' : 'mailgun';
      this.log.error(`Sending via ${preferSender} failed, falling back to ${fallbackSender}`);

      const sender = this.getSender(fallbackSender);
      const id = await sender.send(email);
      return { id, sender: fallbackSender };
    }
  }

  getSender(sender) {
    return sender === 'mailgun' ? this.mailgunService : this.sendgridService;
  }
}
