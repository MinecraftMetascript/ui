import { asset } from '$app/paths';
import * as v from 'valibot';

export type FileTreeDir = {
	name: string;
	isDir: true;
	children?: Record<string, FileTreeItem>;
	data?: any | null;
};

export type FileTreeFile = {
	name: string;
	isDir: false;
	content: string;
	data?: any | null;
};

export type FileTreeItem = FileTreeDir | FileTreeFile;

const symbolSchema = v.object({
	source: v.string(),
	line: v.number(),
	col: v.number(),
	reference: v.string(),
	value: v.any(),
	kind: v.string()
});

const fileTreeItemSchema: v.GenericSchema<unknown, FileTreeItem> = v.union([
	v.object({
		name: v.string(),
		isDir: v.literal(true),
		children: v.optional(
			v.record(
				v.string(),
				v.lazy(() => fileTreeItemSchema)
			)
		),
		data: v.nullable(symbolSchema)
	}),
	v.object({
		name: v.string(),
		isDir: v.literal(false),
		content: v.string(),
		data: v.nullable(symbolSchema)
	})
]);

export const mms = (() => {
	let projectFiles = $state<v.InferOutput<typeof fileTreeItemSchema> | null>(null);
	let projectSymbols = $state<any | null>(null);
	let goInstance = $state<Go | null>(null);

	let mmsImported = false;

	const configure = async () => {
		if (!mmsImported) await import('../mms.js').then(() => (mmsImported = true));
		const res = await fetch(asset(`/mms.wasm`));
		if (!res.body) throw new Error();
		goInstance = new Go();
		const module = await WebAssembly.instantiateStreaming(res, goInstance.importObject);

		const originalExit = goInstance.exit;

		goInstance.exit = (...args) => {
			originalExit(...args);
			// TODO: Improve this behavior
			setTimeout(configure, 1000);
		};

		goInstance.run(module.instance).catch(() => {
			console.error('mms failed');
		});

		if (typeof window !== 'undefined') {
			window.parseLiteralCallback = (project: string, symbols: string) => {
				// IMPORTANT!
				// Any uncaught errors here will crash the MMS process
				try {
					const filesRes = v.safeParse(fileTreeItemSchema, JSON.parse(project));
					if (filesRes.success) projectFiles = filesRes.output;
					else {
						console.error('Failed to parse project files', filesRes.issues);
					}

					projectSymbols = JSON.parse(symbols);
				} catch (e) {
					console.error(e);
				}
			};
		}
	};

	return {
		get projectFiles() {
			return projectFiles;
		},
		get projectSymbols() {
			return projectSymbols;
		},
		get goInstance() {
			return goInstance;
		},
		configure
	};
})();
