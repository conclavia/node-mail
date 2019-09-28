import joi from 'joi';
import { get } from 'lodash';
import 'request';
import request from 'request-promise-native';
import HttpError from '../errors/http-error';
import Email from '../models/email-model';
import LogService from './log-service';

export default class MailgunService {
  constructor({
    log = new LogService(),
    http = request,
    mailgunApiBaseUrl = process.env.MAILGUN_API_BASE_URL,
    mailgunApiDomain = process.env.MAILGUN_API_DOMAIN,
    mailgunApiKey = process.env.MAILGUN_API_KEY,
  } = {}) {
    this.log = log;
    this.http = http;
    this.mailgunApiBaseUrl = mailgunApiBaseUrl;
    this.mailgunApiDomain = mailgunApiDomain;
    this.mailgunApiKey = mailgunApiKey;

    joi.assert(
      { mailgunApiBaseUrl, mailgunApiDomain, mailgunApiKey },
      joi.object({
        mailgunApiBaseUrl: joi.string().required(),
        mailgunApiDomain: joi.string().required(),
        mailgunApiKey: joi.string().required(),
      }),
    );
  }

  async send(email) {
    joi.assert(email, Email.constraints.label('email').required());

    const payload = {
      method: 'POST',
      url: `${this.mailgunApiBaseUrl}/${this.mailgunApiDomain}/messages`,
      auth: {
        user: 'api',
        pass: this.mailgunApiKey,
      },
      headers: {
        'h:Reply-To': email.replyTo,
      },
      form: email,
      json: true,
      timeout: 10 * 1000,
    };

    this.log.debug('Sending mailgun email request', payload);

    try {
      const response = await this.http(payload);
      return response.id;
    } catch (error) {
      this.log.error('Sending mailgun failed', error);
      const message = get(error, 'error.message', error.message);
      throw new HttpError(message, error.statusCode);
    }
  }
}
