import joi from 'joi';

export default class Email {
  constructor({ from, to, cc, bcc, replyTo, subject, text, html } = {}) {
    this.from = from;
    this.to = to;
    this.cc = cc;
    this.bcc = bcc;
    this.replyTo = replyTo;
    this.subject = subject;
    this.text = text;
    this.html = html;
  }

  static get constraints() {
    return joi.object({
      from: joi.string().required(),
      to: joi.string().required(),
      cc: joi.string().empty(''),
      bcc: joi.string().empty(''),
      replyTo: joi.string().empty(''),
      subject: joi.string().required(),
      text: joi.string().required(),
      html: joi.string().empty(''),
    });
  }
}
