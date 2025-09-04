<script lang="ts">
	import { EditorView } from 'codemirror';
	import { CoreExtensions } from './CoreExtensions';
	import type { MMSFile, MMSProject } from '$lib/MMSProject.svelte';
	import { ViewPlugin, ViewUpdate } from '@codemirror/view';

	import { type Diagnostic, linter } from '@codemirror/lint';
	import type { Action } from 'svelte/action';
	import { presets } from './presets';

	let {
		project
	}: {
		project: MMSProject;
	} = $props();

	const file = project.createFile(
		'wasm.mms',
		presets[0].content
	);

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
	const editor: Action = (node: HTMLElement) => {
		view = new EditorView({
			extensions: [
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
						update(update: ViewUpdate) {
							if (update.docChanged) {
								file.updateContent(update.state.doc.toString());
							}
						}
					}
				),
				...CoreExtensions
			],
			parent: node
		});
		syncView();
	};
	let selectedPreset = $state<null | string>(null);
</script>

<section class="flex h-full w-full flex-col items-stretch">
	<header class="flex justify-between px-8">
		<h2 class="text-lg font-bold">Source Editor</h2>
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
	<div class="overflow-y-auto" use:editor></div>
</section>
