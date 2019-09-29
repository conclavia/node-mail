import { expect } from 'chai';
import Email from '../../src/models/email-model';

describe('models/email-model', () => {
  it('constructor should initialise properties', () => {
    const input = {
      from: 'from',
      to: 'to',
      cc: 'cc',
      bcc: 'bcc',
      replyTo: 'replyT0',
      subject: 'subject',
      text: 'text',
      html: 'html',
    };
    const email = new Email(input);
    expect(email).to.eql(input);
  });

  it('empty constructor should initialise empty properties', () => {
    const input = {
      from: undefined,
      to: undefined,
      cc: undefined,
      bcc: undefined,
      replyTo: undefined,
      subject: undefined,
      text: undefined,
      html: undefined,
    };
    const email = new Email();
    expect(email).to.eql(input);
  });
});
