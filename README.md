## Example Moesif Open Telemetry with a Nodejs Project

### Set up
- copy `.env-template` to `.env` and put in your Moesif Application ID.
- `npm install` install dependencies
- `npm run start-with-otel`
- and then send API calls via curl or similar tools.
  - `curl http://localhost:6060/todos`


### Limitations  

1. Traces and Logs are supported, but not OpenTelemetry Metrics. Within Traces, HTTP Spans are supported. [Spans](https://opentelemetry.io/docs/specs/semconv/http/http-spans/) for other types of information cannot be ingested.
2. Moesif's governance features, such as blocking or modifying API calls, are not supported through the OpenTelemetry integration.
3. Moesif's dynamic sampling is not applied to data ingested through OpenTelemetry. 
You must manually configure [sampling within your OpenTelemetry tooling](https://opentelemetry.io/docs/concepts/sampling/). If you do so, set the weight attribute as described in 
[Sampling and Weight Attribute](https://www.moesif.com/docs/server-integration/open-telemetry/#sampling--weight-attribute).

### Troubleshooting

Temporarily switch to console exporter to see what data is exporting.

```
 traceExporter: new ConsoleSpanExporter()
```
