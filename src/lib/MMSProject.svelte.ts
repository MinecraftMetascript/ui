import { Go, type FileTreeLike, type MmsSymbol } from '@minecraftmetascript/mms-wasm';
import MMSWasm from '@minecraftmetascript/mms-wasm/dist/main.wasm?init';
import * as deepslate from 'deepslate';
import * as zip from '@zip.js/zip.js';
import { debounce } from 'es-toolkit';

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

	private goUpdate = debounce(updateFile, 100);
	async updateContent(content: string) {
		if (!content) return;
		this._content = content;
		this.goUpdate(this.filename, content, (result: Uint8Array) => {
			this.project.onProjectUpdate(atob(result.toBase64()));
			getFileDiag(this.filename, (serialDiag: string) => {
				if (serialDiag) this._diagnostics = JSON.parse(serialDiag);
				else this._diagnostics = [];
			});
		});
	}
}

export class MMSProject {
	private readonly goInstance: Go;
	async download() {
		const zipFileWriter = new zip.BlobWriter();
		const zipWriter = new zip.ZipWriter(zipFileWriter);
		const addLeaves = (root: FileTreeLike, path: string[] = []) => {
			if (root.isDir) {
				for (const [, child] of Object.entries(root.children ?? {}))
					addLeaves(child, [...path, root.name]);
			} else {
				zipWriter.add([...path, root.name].join('/'), new zip.TextReader(JSON.stringify(root)));
			}
		};
		if (!this._fs) return;
		addLeaves(this._fs);
		await zipWriter.close();

		const zipFileBlob = await zipFileWriter.getData();
		const url = URL.createObjectURL(zipFileBlob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'project.zip';
		a.click();
		// URL.revokeObjectURL(url);
		a.remove();
	}

	private lspReaders = new Set<(s: string) => void>();
	lspSub(fn: (s: string) => void) {
		this.lspReaders.add(fn);
	}
	lspUnsub(fn: (s: string) => void) {
		this.lspReaders.delete(fn);
	}

	partial: string | null = null;
	lspRead = (s: string | Uint8Array) => {
		let msgStr: string;
		// chop off the header
		if (s instanceof Uint8Array) {
			msgStr = atob(s.toBase64());
		} else {
			msgStr = s;
		}
		try {
			let message = msgStr.split('\r\n\r\n')[1];
			if (message === '' || message === undefined) {
				message = msgStr;
			}
			if (this.partial) {
				if (message) message = this.partial + message;
				else message = this.partial;
			}
			try {
				this.partial = '';
				this.lspReaders.forEach((r) => r(message));
			} catch (e) {
				if (message) {
					this.partial = message;
				} else console.warn(e);
			}
		} catch (e) {
			console.error(e);
		}
	};
	lspWrite(s: string) {
		const encoder = new TextEncoder();

		const body = encoder.encode(s);
		const header = encoder.encode(`Content-Length: ${body.byteLength}\r\n\r\n`);

		const packet = new Uint8Array(body.byteLength + header.byteLength);
		packet.set(header, 0);
		packet.set(body, header.byteLength);

		// Send exact bytes
		// @ts-ignore allow Uint8Array until typings are updated
		globalThis.mmsLspWrite(packet);
	}

	async init(signal?: AbortSignal) {
		globalThis.mmsLspRead = this.lspRead;
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
	private _symbols: Record<string, Record<string, MmsSymbol>> | null;
	get symbols() {
		return this._symbols;
	}
	private set symbols(next: Record<string, Record<string, MmsSymbol>> | null) {
		for (const [ns, v] of Object.entries(next ?? {})) {
			for (const [n, s] of Object.entries(v)) {
				switch (s.kind) {
					case 'Noise': {
						deepslate.WorldgenRegistries.NOISE.register(
							new deepslate.Identifier(ns, n),
							deepslate.NoiseParameters.fromJson(s.kind)
						);
					}
				}
			}
		}
		this._symbols = next;
	}

	private _source: Record<string, string>;
	get source() {
		return { ...this._source };
	}

	readonly onProjectUpdate = (proj: string) => {
		const data = JSON.parse(proj);
		this._fs = data.files;
		this.symbols = data.symbols;
		this._source = data.source;
	};

	createFile = (filename: string, content: string) => {
		const f = new MMSFile(this, filename);
		f.updateContent(content);

		return f;
	};

	getFile = (path: string[]) => {
		return path.reduce<FileTreeLike | null>((fs: FileTreeLike | null, name: string) => {
			if (fs?.isDir) {
				return fs.children?.[name] ?? null;
			} else {
				return fs;
			}
		}, this.fs);
	};
}
