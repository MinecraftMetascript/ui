import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import faroUploader from '@grafana/faro-rollup-plugin';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		host: '0.0.0.0',
		port: 8080,
		fs: {
			allow: ['./static']
		}
	},
	build: {
		rollupOptions: {
			plugins: [
				faroUploader({
					appName: 'Metascript Editor',
					endpoint: 'https://faro-api-prod-us-east-2.grafana.net/faro/api/v1',
					appId: '769',
					stackId: '1405494',
					verbose: true,
					// instructions on how to obtain your API key are in the documentation
					// https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/sourcemap-upload-plugins/#obtain-an-api-key
					apiKey: process.env.FARO_SOURCEMAP_UPLOAD_API_KEY ?? '',
					gzipContents: true
				})
			]
		}
	}
	// optimizeDeps: {
	// 	exclude: ['@minecraftmetascript/mms-wasm']
	// }
});
