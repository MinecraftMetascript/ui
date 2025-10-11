<script lang="ts" module>
	let help = $state<string>('');
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Markdown } from 'svelte-exmarkdown';

	onMount(() => {
		if (!help) {
			console.log('Started getting spec');
			const r = getMmsSpec();
			console.log('Got Spec', { r });
			help = atob(r.toBase64());
		}
	});
</script>

<div
	class="
    prose-hr:border-b prose-hr:mx-6 prose prose-sm
    max-w-full
    px-4 py-2 prose-slate
    prose-h2:mx-2
    prose-h3:mx-4
    prose-h4:mx-6 prose-h4:text-base
    prose-headings:m-0 prose-h5:mx-8 prose-h5:font-bold prose-h6:mx-8 prose-p:mx-10 prose-p:my-0
    prose-h6:text-sm prose-h6:font-bold prose-h6:uppercase prose-pre:my-1
    prose-h6:italic prose-h6:text-slate-600 prose-hr:my-2
    prose-hr:border-slate-800
    prose-pre:mx-10
"
>
	<Markdown md={help} />
</div>
