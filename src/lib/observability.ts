let initialized = false;
let faro: import('@grafana/faro-web-sdk').Faro | null = null;

export const registerEvent = (name: string, attributes: Record<string, string>) => {
	faro?.api.pushEvent(name, attributes);
};

let previousError: { error: Error; stamp: number } | undefined;

export const registerError = (error: Error, projectContent: string) => {
	if (previousError?.error.message === error.message) {
		if (previousError.stamp > performance.now() - 500) {
			previousError.stamp = performance.now() - 500;
			return;
		}
	}
	faro?.api.pushError(error, { context: { project: projectContent } });
	previousError = { error: error, stamp: performance.now() };
};

export const initializeObservability = async () => {
	if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
		console.log('RUM is not enabled for dev sessions');
	}
	if (initialized) return;
	const { getWebInstrumentations, initializeFaro, LogLevel } = await import(
		'@grafana/faro-web-sdk'
	);
	const { TracingInstrumentation } = await import('@grafana/faro-web-tracing');

	faro = initializeFaro({
		url: 'https://faro-collector-prod-us-east-2.grafana.net/collect/948f3a6de75e863f21f276c8cc9bd844',
		app: {
			name: 'Metascript Editor',
			version: '1.0.0',
			environment: 'production'
		},

		instrumentations: [
			// Mandatory, omits default instrumentations otherwise.
			...getWebInstrumentations({
				captureConsole: true,
				captureConsoleDisabledLevels: [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.LOG]
			}),

			// Tracing package to get end-to-end visibility for HTTP requests.
			new TracingInstrumentation()
		]
	});

	initialized = true;
	console.log('Grafana Faro initialized');
};
