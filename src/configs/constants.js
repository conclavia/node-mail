/**
 * Access to run-time constants
 */
export default class Constants {
  static get SERVICE_HOST() {
    return process.env.SERVICE_HOST;
  }

  static get SERVICE_NAME() {
    return process.env.SERVICE_NAME;
  }

  static get STAGE() {
    return process.env.STAGE;
  }

  static get mailgunApiBaseUrl() {
    return { name: 'MAILGUN_API_BASE_URL', path: process.env.SSM_MAILGUN_API_BASE_URL };
  }

  static get mailgunApiDomain() {
    return { name: 'MAILGUN_API_DOMAIN', path: process.env.SSM_MAILGUN_API_DOMAIN };
  }

  static get mailgunApiKey() {
    return { name: 'MAILGUN_API_KEY', path: process.env.SSM_MAILGUN_API_KEY };
  }

  static get sendgridApiBaseUrl() {
    return { name: 'SENDGRID_API_BASE_URL', path: process.env.SSM_SENDGRID_API_BASE_URL };
  }

  static get sendgridApiKey() {
    return { name: 'SENDGRID_API_KEY', path: process.env.SSM_SENDGRID_API_KEY };
  }

  /**
   * Gets all the API parameters
   * @return {string[]}
   */
  static get parameters() {
    return [
      Constants.mailgunApiBaseUrl,
      Constants.mailgunApiDomain,
      Constants.mailgunApiKey,
      Constants.sendgridApiBaseUrl,
      Constants.sendgridApiKey,
    ];
  }
}
