<script lang="ts">
	import type { LeafNode } from './types';

	type Props = {
		node: LeafNode;
		onclick: () => void;
        active: boolean
	};

	let { node, onclick, active }: Props = $props();
</script>

<button
	class="flex w-full justify-start px-2 py-0.5 text-sm hover:bg-slate-300 hover:text-slate-900"
	{onclick}
    class:bg-slate-200={active}
    class:text-slate-900={active}
>
	<span>{node.name}</span>
</button>
