require("dotenv").config();
const opentelemetry = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations
} = require("@opentelemetry/auto-instrumentations-node");
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');

const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { W3CTraceContextPropagator } = require("@opentelemetry/core");
const {
  OTLPTraceExporter
} = require("@opentelemetry/exporter-trace-otlp-proto");
const {
  OTLPMetricExporter
} = require("@opentelemetry/exporter-metrics-otlp-proto");
const { PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");
const { Resource } = require("@opentelemetry/resources");
const {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION
} = require("@opentelemetry/semantic-conventions");

const sdk = new opentelemetry.NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: "todos-server",
    [ATTR_SERVICE_VERSION]: "0.1.0"
  }),
  // toggle to console exporter to debug your setup.
  // traceExporter: new ConsoleSpanExporter(),
  traceExporter: new OTLPTraceExporter({
    url: `https://api.moesif.net/v1/traces`,
    // optional - collection of custom headers to be sent with each request, empty by default
    headers: {}
  }),
  // metricReader: new PeriodicExportingMetricReader({
  //   exporter: new OTLPMetricExporter({
  //     headers: {}, // an optional object containing custom headers to be sent with each request
  //     concurrencyLimit: 1 // an optional limit on pending requests
  //   })
  // }),
  instrumentations: [
    getNodeAutoInstrumentations(),
    new HttpInstrumentation({
      headersToSpanAttributes: {
        client: {
          requestHeaders: [
            "User-Agent",
            "Authorization",
            "X-User-Id",
            "X-Test-Header",
            "X-Company-Id"
          ],
          responseHeaders: [
            "Content-Type",
            "X-User-Id",
            "X-Test-Header",
            "X-Company-Id"
          ]
        },
        server: {
          requestHeaders: [
            "User-Agent",
            "Authorization",
            "X-User-Id",
            "X-Test-Header",
            "X-Company-Id"
          ],
          responseHeaders: [
            "Content-Type",
            "X-User-Id",
            "X-Test-Header",
            "X-Company-Id"
          ]
        }
      }
    })
  ],
  textMapPropagator: new W3CTraceContextPropagator()
});
sdk.start();
