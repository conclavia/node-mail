import express from 'express';
import joi from 'joi';
import EmailService from '../services/email-service';
import LogService from '../services/log-service';

export default class EmailController {
  constructor({ log = new LogService(), emailService = new EmailService({ log }) } = {}) {
    this.log = log;
    this.emailService = emailService;
  }

  static middleware(controller) {
    return express
      .Router()
      .use((req, res, next) => {
        req.controller = controller || new EmailController({ log: req.log });
        next();
      })
      .post('/', (req, res) => req.controller.send(req, res));
  }

  async send(req, res) {
    try {
      const {
        body: {
          data: { attributes },
        },
        headers: { 'x-prefer-sender': preferSender, 'x-no-fallback': noFallback },
      } = joi.attempt(
        { body: req.body, headers: req.headers },
        joi.object({
          body: joi
            .object({
              data: joi
                .object({
                  type: joi
                    .string()
                    .valid('email')
                    .required(),
                  attributes: joi.object().required(),
                })
                .required(),
            })
            .required(),
          headers: joi
            .object({
              'x-prefer-sender': joi
                .string()
                .valid('mailgun', 'sendgrid')
                .default('mailgun'),
              'x-no-fallback': joi.boolean().default(false),
            })
            .unknown(),
        }),
      );

      const { id, sender } = await this.emailService.send(attributes, preferSender, noFallback);
      res.status(202).json({ data: { id, type: 'email-response', attributes: { sender } } });
    } catch (error) {
      this.log.error('Sending email failed', error);
      res.jsonError(error);
    }
  }
}
