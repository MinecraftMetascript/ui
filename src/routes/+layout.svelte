<script lang="ts">
	import '../app.css';

	let { children } = $props();
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
		<a href="https://github.com/minecraftmetascript/mms" target="_blank">
			<button class="absolute top-2 right-2">Github</button>
		</a>
	</header>
	{@render children?.()}
</main>
