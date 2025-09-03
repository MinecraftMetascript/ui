import { Go, type FileTreeLike, type MmsSymbol } from '@mms/wasm';
import MMSWasm from '@mms/wasm/dist/main.wasm?init';

export class MMSFile {
	private _content: string;
	get content() {
		return this._content;
	}

	private _diagnostics: any[];
	get diagnostics() {
		return this._diagnostics;
	}

	constructor(
		readonly project: MMSProject,
		readonly filename: string
	) {
		this._content = $state('');
		this._diagnostics = $state([]);
	}

	async updateContent(content: string) {
		if (!content) return;
		this._content = content;
		updateFile(this.filename, content, (...args) => {
			this.project.onProjectUpdate(...args);
			getFileDiag(this.filename, (serialDiag: string) => {
				if (serialDiag) this._diagnostics = JSON.parse(serialDiag);
				else this._diagnostics = [];
			});
		});
	}
}

export class MMSProject {
	private readonly goInstance: Go;

	async init(signal?: AbortSignal) {
		const wasmInstance = await MMSWasm(this.goInstance.importObject);
		this.goInstance.run(wasmInstance).catch((err) => {
			console.error('MMS WASM Failed: ', { err });
		});
		signal?.addEventListener('abort', () => {
			console.log('Abort Signal Received. Quitting MMS');
			this.goInstance.exit(1);
		});
	}

	constructor() {
		this.goInstance = new Go();
		const originalExit = this.goInstance.exit.bind(this.goInstance);
		this.goInstance.exit = (...args) => {
			originalExit(...args);
			// We should have a better backoff behavior here
			console.log('Failed, scheduling restart');
			setTimeout(this.init, 1000);
		};

		this._fs = $state(null);
		this._symbols = $state(null);
		this._source = $state({});
	}

	private _fs: (FileTreeLike & { isDir: true }) | null;
	get fs() {
		return this._fs;
	}
	private _symbols: Record<string, MmsSymbol> | null;
	get symbols() {
		return this._symbols;
	}

	private _source: Record<string, string>;
	get source() {
		return { ...this._source };
	}

	readonly onProjectUpdate = (proj: string) => {
		const data = JSON.parse(proj);
		this._fs = data.files;
		this._symbols = data.symbols;
		this._source = data.source;
	};

	createFile = (filename: string, content: string) => {
		const f = new MMSFile(this, filename);
		f.updateContent(content);

		return f;
	};
}
