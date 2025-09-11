<script lang="ts">
	import { EditorView } from 'codemirror';
	import { CoreExtensions } from './CoreExtensions';
	import { LSPClient, LSPPlugin } from '@codemirror/lsp-client';
	import { ViewPlugin, ViewUpdate } from '@codemirror/view';
	import { StateEffect, StateField } from '@codemirror/state';
	import { type Diagnostic, linter } from '@codemirror/lint';
	import type { Action } from 'svelte/action';
	import { presets } from './presets';
	import { useEditorContext } from './MMSEditor.svelte';
	import { onMount } from 'svelte';
	import { debounce } from 'es-toolkit';

	const editor = useEditorContext();

	import { Decoration } from '@codemirror/view';
	import type { MmsSymbol } from '@minecraftmetascript/mms-wasm';
	const selectedSymbolMark = Decoration.mark({
		class: `
				relative
				after:bg-yellow-300/60
				after:z-[-1]
				after:block after:-left-0.5 after:-top-0.5
				after:absolute after:-top-0.5 
				after:-inset-0.5
				`,
		kind: 'MMS::SelectedSymbol'
	});
	const selectedSymbolField = StateField.define({
		create() {
			return Decoration.none;
		},
		update(decorations, transaction) {
			decorations = decorations.map(transaction.changes); // Adjust positions for document changes
			const symbolSelections = transaction.effects.findLast((e) => e.is(selectSymbol));
			if (symbolSelections) {
				const { nameLocation: name, contentLocation: content } = symbolSelections.value.symbol;
				decorations = decorations.update({
					add: [selectedSymbolMark.range(name.StartIdx, Math.max(name.StopIdx, content.StopIdx) + 1)],
					filter(a, b, v) {
						return v.spec.kind !== 'MMS::SelectedSymbol';
					}
				});
			}
			const symbolUnselection = transaction.effects.findLast((e) => e.is(unselectSymbol));
			if (symbolUnselection) {
				decorations = decorations.update({
					filter(a, b, v) {
						return v.spec.kind !== 'MMS::SelectedSymbol';
					}
				});
			}
			return decorations;
		},
		provide: (f) => EditorView.decorations.from(f)
	});
	const selectSymbol = StateEffect.define<{ symbol: MmsSymbol }>();
	const unselectSymbol = StateEffect.define<{}>();
	$effect(() => {
		if (
			editor.previewSymbol &&
			file.content.length > editor.previewSymbol.contentLocation.StopIdx
		) {
			view?.dispatch({
				effects: [selectSymbol.of({ symbol: editor.previewSymbol })]
			});
		} else if (!editor.previewSymbol) {
			view?.dispatch({
				effects: [unselectSymbol.of({})]
			});
		}
	});

	const file = editor.project.createFile('wasm.mms', '');
	onMount(() => {
		const stored = localStorage.getItem('MMS:FileContent');
		if (stored) {
			file.updateContent(stored);
		} else {
			file.updateContent(`Namespace x { DensityFn { TestNoise = Noise(-5).Amplitudes(5) } }`);
		}
		syncView();
	});

	const syncView = () => {
		if (!view) return;
		view.dispatch({
			changes: [
				{
					from: 0,
					to: view.state.doc.length,
					insert: file.content
				}
			]
		});
	};

	let view = $state<EditorView | null>(null);
	const codemirror: Action = (node: HTMLElement) => {
		// const lspClient = new LSPClient();
		// lspClient.connect({
		// 	send() {

		// 	},
		// 	subscribe() {},
		// 	unsubscribe() {}
		// });

		view = new EditorView({
			extensions: [
				// lspClient.plugin("wasm.mms"),
				linter(() => {
					return (
						file.diagnostics
							?.map<Diagnostic>((diag) => ({
								from: diag.where.StartIdx,
								to: diag.where.StopIdx,
								severity: diag.severity,
								message: diag.message
							}))
							.sort((a, b) => b.from - a.from) ?? []
					);
				}),
				ViewPlugin.fromClass(
					class {
						private flush = debounce((docStr: string) => {
							file.updateContent(docStr);
							localStorage.setItem('MMS:FileContent', docStr);
						}, 250);
						update(update: ViewUpdate) {
							if (update.docChanged) {
								this.flush(update.state.doc.toString());
							}
						}
					}
				),
				selectedSymbolField,
				...CoreExtensions
			],
			parent: node
		});

		syncView();
	};
	let selectedPreset = $state<null | string>(null);
</script>

<section class="flex h-full w-full flex-col items-stretch">
	<header class="flex justify-between px-8 bg-slate-300 py-1">
		<h2 class="text-xl font-bold">Source Editor</h2>
		<div class="flex items-center gap-4">
			<select bind:value={selectedPreset} class="border-b border-b-slate-800">
				<option disabled></option>
				{#each presets as { label, content }}
					<option value={content}>{label}</option>
				{/each}
			</select>
			<button
				disabled={!selectedPreset}
				class="
					px-1 py-0.5 hover:bg-slate-200
					active:bg-slate-300 disabled:cursor-default disabled:bg-transparent disabled:text-gray-500
				"
				onclick={() => {
					if (!selectedPreset) return;
					file.updateContent(selectedPreset);
					syncView();
					selectedPreset = '';
				}}>Load Preset</button
			>
		</div>
	</header>
	<div class="overflow-y-auto" use:codemirror></div>
</section>
