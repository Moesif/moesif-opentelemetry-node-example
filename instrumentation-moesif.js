require("dotenv").config();
const opentelemetry = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations
} = require("@opentelemetry/auto-instrumentations-node");

const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");

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
  traceExporter: new OTLPTraceExporter({
    // optional - default url is http://localhost:4318/v1/traces
    url: `https://api-dev.moesif.net/v1/traces`,
    // optional - collection of custom headers to be sent with each request, empty by default
    headers: {}
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      // url: "<your-otlp-endpoint>/v1/metrics", // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
      headers: {}, // an optional object containing custom headers to be sent with each request
      concurrencyLimit: 1 // an optional limit on pending requests
    })
  }),
  instrumentations: [getNodeAutoInstrumentations(), new HttpInstrumentation()]
});
sdk.start();
