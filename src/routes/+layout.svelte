<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon';
	import '../app.css';
	import { BrandGithub, Bug } from '@steeze-ui/tabler-icons';
	import { createEditorContext } from '../lib/editor/MMSEditor.svelte';

	let { children } = $props();
	const editor = createEditorContext();

	let issueLink = $derived.by(() => {
		const out = new URL('https://github.com/minecraftmetascript/mms/issues/new');

		out.searchParams.set(
			'body',
			`
# MMS Editor Bug Report:

## Problem

*[add a short description of the issue you're having here]*

## Expected Behavior

*[add a short description of what you expected to happen here]*

<details>
<summary>Issue Script</summary>
\`\`\`
${editor.project.source['wasm.mms']}
\`\`\`
</details>
`.trim()
		);

		return out.toString();
	});

	$inspect(editor.project.source);
</script>

<main class="flex h-svh w-svw flex-col">
	<header class="relative px-2 py-1">
		<h1 class="text-xl font-bold">Minecraft Metascript Demo Editor</h1>
		<p class="max-w-[100ch] text-xs">
			Minecraft Metascript (MMS) is a language for authoring Minecraft datapacks. It intends to
			provide a more concise and readable syntax compared to the default JSON format.
			<br />
			This page runs an instance of the MMS parser and serializer in your browser using WebAssembly.
			<br />
			This tool is <strong>NOT</strong> production ready.
		</p>
		<div class="absolute top-2 right-2 flex justify-end gap-4 text-sm">
			<a
				href={issueLink}
				target="_blank"
				class="flex items-center gap-1 font-mono text-sm whitespace-nowrap uppercase hover:underline"
			>
				<Icon src={Bug} class="h-4" />
				Report an Issue
			</a>
			<a
				href="https://github.com/minecraftmetascript/mms"
				target="_blank"
				class="flex items-center gap-1 font-mono text-sm uppercase hover:underline"
			>
				<Icon src={BrandGithub} class="h-4" />
				Github
			</a>
		</div>
	</header>
	{@render children?.()}
</main>
