## Example Moesif Open Telemetry with a Nodejs Project

### Set up
- copy `.env-template` to `.env` and put in your Moesif Application ID.
- `npm install` install dependencies
- `npm run start-with-otel`
- and then send API calls via curl or similar tools.
  - `curl http://localhost:6060/todos`


### Limitations

- Currently, only API spans are imported into Moesif.

### Troubleshooting

Temporarily switch to console exporter to see what data is exporting.

```
 traceExporter: new ConsoleSpanExporter()
```
