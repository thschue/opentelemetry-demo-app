'use strict';

const opentelemetry = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

const EXPORTER = process.env.EXPORTER || '';
const jaegerHost = process.env.JAEGER_HOSTNAME;
const jaegerPort = process.env.JAEGER_PORT;

module.exports = (serviceName) => {
  const provider = new NodeTracerProvider({
    plugins: {
      mongodb: {
        enabled: true,
        path: '@opentelemetry/plugin-mongodb',
      },
    }
  });

  const consoleExporter = new ConsoleSpanExporter()
  const consoleProcessor = new SimpleSpanProcessor(consoleExporter)
  provider.addSpanProcessor(consoleProcessor)

  let exporter;
  if (EXPORTER.toLowerCase().startsWith('z')) {
    exporter = new ZipkinExporter({
      serviceName,
    });
  } else {
    exporter = new JaegerExporter({
      serviceName,
      host: jaegerHost,
      port: jaegerPort,
    });
  }

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();

  return opentelemetry.trace.getTracer('http-example');
};
