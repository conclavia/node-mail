import joi from 'joi';
import { get } from 'lodash';
import 'request';
import request from 'request-promise-native';
import HttpError from '../errors/http-error';
import Email from '../models/email-model';
import LogService from './log-service';

export default class SendgridService {
  constructor({
    log = new LogService(),
    http = request,
    sendgridApiBaseUrl = process.env.SENDGRID_API_BASE_URL,
    sendgridApiKey = process.env.SENDGRID_API_KEY,
  } = {}) {
    this.log = log;
    this.http = http;
    this.sendgridApiBaseUrl = sendgridApiBaseUrl;
    this.sendgridApiKey = sendgridApiKey;

    joi.assert(
      { sendgridApiBaseUrl, sendgridApiKey },
      joi.object({
        sendgridApiBaseUrl: joi.string().required(),
        sendgridApiKey: joi.string().required(),
      }),
    );
  }

  async send(email) {
    joi.assert(email, Email.constraints.label('email').required());

    const body = {
      personalizations: [
        {
          to: email.to.split(',').map(address => ({ email: address })),
          cc: email.cc ? email.cc.split(',').map(address => ({ email: address })) : undefined,
          bcc: email.bcc ? email.bcc.split(',').map(address => ({ email: address })) : undefined,
        },
      ],
      from: { email: email.from },
      reply_to: email.replyTo ? { email: email.replyTo } : undefined,
      subject: email.subject,
      content: [],
    };

    if (email.text) body.content.push({ type: 'text/plain', value: email.text });
    if (email.html) body.content.push({ type: 'text/html', value: email.text });

    const payload = {
      auth: { bearer: this.sendgridApiKey },
      body,
      json: true,
      method: 'POST',
      resolveWithFullResponse: true,
      timeout: 10 * 1000,
      url: `${this.sendgridApiBaseUrl}/mail/send`,
    };

    this.log.debug('Sending sendgrid email request', payload);

    try {
      const response = await this.http(payload);
      return response.headers['x-message-id'];
    } catch (error) {
      this.log.error('Sending sendgrid failed', error);
      const message = get(error, 'error.errors[0].message', error.message);
      throw new HttpError(message, error.statusCode);
    }
  }
}
