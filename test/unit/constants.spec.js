import { expect } from 'chai';

import Constants from '../../src/configs/constants';

describe('configs/constants', () => {
  it('should export service name', () => {
    process.env.SERVICE_NAME = 'SERVICE_NAME';
    expect(Constants.SERVICE_NAME).to.equal(process.env.SERVICE_NAME);
  });

  it('should export service host', () => {
    process.env.SERVICE_HOST = 'SERVICE_HOST';
    expect(Constants.SERVICE_HOST).to.equal(process.env.SERVICE_HOST);
  });

  it('should export stage', () => {
    process.env.STAGE = 'STAGE';
    expect(Constants.STAGE).to.equal(process.env.STAGE);
  });

  it('should export store parameters', () => {
    process.env.SSM_MAILGUN_API_BASE_URL = 'MAILGUN_API_BASE_URL';
    process.env.SSM_MAILGUN_API_DOMAIN = 'MAILGUN_API_DOMAIN';
    process.env.SSM_MAILGUN_API_KEY = 'MAILGUN_API_KEY';
    process.env.SSM_SENDGRID_API_BASE_URL = 'SENDGRID_API_BASE_URL';
    process.env.SSM_SENDGRID_API_KEY = 'SENDGRID_API_KEY';

    expect(Constants.parameters).to.deep.eql([
      { name: 'MAILGUN_API_BASE_URL', path: process.env.SSM_MAILGUN_API_BASE_URL },
      { name: 'MAILGUN_API_DOMAIN', path: process.env.SSM_MAILGUN_API_DOMAIN },
      { name: 'MAILGUN_API_KEY', path: process.env.SSM_MAILGUN_API_KEY },
      { name: 'SENDGRID_API_BASE_URL', path: process.env.SSM_SENDGRID_API_BASE_URL },
      { name: 'SENDGRID_API_KEY', path: process.env.SSM_SENDGRID_API_KEY },
    ]);
  });
});
