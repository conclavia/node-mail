# node-mail

Send email with a Node JS microservice

## Quick-start

- Copy `.env.example` to `.env`
- Set your [Mailgun](https://www.mailgun.com) domain and API key
- Set your [Sendgrid](https://sendgrid.com) API key
- `npm install`
- `npm test`
- `npm start`
- View https://localhost:3000/docs/ to see the API documentation

## Development

### Deploying to AWS

1. Follow [quick-start](Quick-start) guide
   - There are three profiles configured, `dev`, `stg` and `prd`. Use the appropriate profile when deploying to your AWS environment.
   - The profiles will also allow you to assume roles if your AWS environment uses roles for deployment.
2. Configure your AWS credentials (see [how-to](https://serverless.com/framework/docs/providers/aws/guide/credentials/) help)
3. Configure your `.env` file with the Mailgun and Sendgrid API credentials. Alternatively, use command-line arguments to set the values
   - `--mailgun-api-base-url`
   - `--mailgun-api-domain`
   - `--mailgun-api-key`
   - `--sendgrid-api-base-url`
   - `--sendgrid-api-key`
4. `npm run deploy:dev`

#### Deployment in CI

- Mailgun and Sendgrid API keys will be read from the build `env` automatically.
- Use `npm run package` and `npm run deploy` to separate build and deploy steps (useful when saving build artefacts).

#### Logging

- Set the environment variable `LOG_LEVELS=DEBUG` to view debugging output.
- Other valid levels include `VERBOSE,DEBUG` which can be used together.

### Generating you own self-signed cert for local SSL

- Use [Pluralsight's tool](https://www.pluralsight.com/blog/software-development/selfcert-create-a-self-signed-certificate-interactively-gui-or-programmatically-in-net) to generate a certificate
- Save the certificate to `/internals/localhost.pfx`
- Update `/src/api-local.js` with the certificate password you used to generated the `localhost.pfx`

### Further reading

- The API contracts conform to [{ json:api }](https://jsonapi.org/) formatting specifications
- The project is based on the open-source template [micro-lambda](https://github.com/triqi/micro-lambda) (Node JS, Express, AWS Lambda)
