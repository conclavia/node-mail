# Architecture

## Design

I have designed this project with the following design goals.

- Simplicity of infrastructure by reducing the number of moving parts.
- Maintainability by keeping the code lean and well tested
- Operability with the help of comprehensive tracing and logging.

With this goal, using AWS Cloud and [serverless framework], I was able to quickly design and deploy a production-ready solution.

![architecture]

---

## Best practice

This solution has a number of best practices embedded within it to ensure that it can evolve with changing requirements.

- Well documented API with [Swagger OAS3.0]
  - This is to ensure that documentation stays fresh and relevant with the source code it changes.
- Well documented API contracts with [{ json:api }] specification.
  - This is to ensure a standardise set of rules that is consistent and flexible.
- Highly configurable with the help of [AWS Parameter Store].
  - This allows secrets to be stored securely with AWS encryption.
  - This allows keys to be updated without infrastructure deployments.
- High visibility during runtime with the help of AWS CloudWatch and X-Ray tracing
  - This ensures that errors and up-time is visible and monitored in real-time.
  - See DevOps section below for details.
- Ensure quality with minimum unit test coverage with [nyc].
  - Unit test coverage should be set at 85% or above.
- Improve dev experience with the help of local development environment
  - Work offline with local express app.
  - Quickly get started with useful `npm` scripts.
  - Keep code clean with appropriate code linting and formatting rules.

---

## DevOps

Part of a well architect solution design must take DevOps practices into account - CI/CD, deployment and monitoring. The biggest impact of DevOps in this project is the use of AWS Lambda Functions + CloudFormation templates. The combination of these two technologies reduces the need to maintain services, patching OS or manage auto-scaling groups. Deployment is a breeze with AWS CloudFormation.

### Logging

Logging is achieved with the help of AWS CloudWatch and a in-code logging strategy. I have created a simple logging service that will ensure that logging within the service will produce consistent and well-formed log outputs. Well formed JSON log outputs is easily digested by log aggregators such as Sumo Logic or AWS CloudWatch Insights.

#### Log output features

- System context, e.g. service name, version, log level.
- Correlation tracing with `cid` that will cross multiple microservice.
- Structured message and metadata properties

![logging]

### Monitoring

Along with logging, it is important to be able to monitor inbound and outbound traffic for each microservice. Using AWS X-Ray is a quick and powerful method of monitoring application health and trace traffic (and errors) across the AWS infrastructure.

The trace map example below shows the state of the `mailgun` outbound calls resulting in errors and the fallback to `sendgrid` resulting in success.

![tracing]

---

## Improvements

Below are a list of items for improvement that has not been completed in this solution.

- Web Application Firewall and security rules to be applied with the CloudFormation template.
- Improve unit tests and add integration testing.
- Lock down API Swagger documentation to only authorised users.
- Aggregate log output with a log aggregator
- Set up alert rules for outages or service degradation.

[serverless framework]: https://serverless.com/
[architecture]: ./.architecture/architecture.png
[swagger oas3.0]: https://swagger.io/specification/
[{ json:api }]: https://jsonapi.org/
[aws parameter store]: https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html
[nyc]: https://github.com/istanbuljs/nyc
[logging]: ./.architecture/logging.png
[tracing]: ./.architecture/tracing.png
