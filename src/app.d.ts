// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}


	// Courtesy of mms.js (wasm_exec.js from go)
	var Go: typeof import("@types/golang-wasm-exec").Go;
	var parseLiteral: (content: string) => void;
	var parseLiteralCallback: (serializedFiletree: string, serializedFileSymbols: string) => void;
}

export {};
