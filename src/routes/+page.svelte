<script lang="ts">
	import { debounce } from 'es-toolkit';
	import Editor from '../lib/Editor.svelte';
	import Preview from '../lib/Preview.svelte';
	import { mms } from '../lib/MMSInterop.svelte';
	import { onMount } from 'svelte';

	let fileContent = $state(`
namespace example_project;

worldgen {
	noise MyNoisePattern -4 [ 2 5 ]
}

surface {
	rule MySurfaceRule block stone

	condition OnlyForest biome [ minecraft:forest ]
	condition OnlyPlains biome [ minecraft:plains ]

	rule WoodInForests if (OnlyForest) block wood
	rule LavaHoles if ( and ( OnlyForest OnlyPlains hole ) ) block lava
}
	`);

	const refresh = debounce((str: string) => {
		parseLiteral(str);
	}, 500);
	$effect(() => {
		if (mms.goInstance) {
			refresh(fileContent);
		}
	});
	onMount(() => mms.configure().catch((e) => console.error('Failed to configure MMS Runtime', e)));
</script>

<section class="grid min-h-svh grid-rows-[auto_1fr]">
	<header class="px-2 py-1">
		<h1 class="text-xl font-bold">Minecraft Metascript Demo Editor</h1>
		<p class="max-w-[100ch] text-xs">
			Minecraft Metascript (MMS) is a language for authoring Minecraft datapacks. It intends to
			provide a more concise and readable syntax compared to the default JSON format.
			<br />
			This page runs an instance of the MMS parser and serializer in your browser using WebAssembly.
			<br />
			This tool is <strong>NOT</strong> production ready.
		</p>
	</header>

	<div class="flex flex-col">
		<h2 class="px-2 py-1 text-sm font-bold">MMS Source Code</h2>
		<Editor bind:value={fileContent} />
		<Preview files={mms.projectFiles} symbols={mms.projectSymbols} />
	</div>
</section>
