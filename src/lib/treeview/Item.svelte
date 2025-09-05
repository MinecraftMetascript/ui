<script lang="ts">
	import { treeViewLevel } from './internal';

	let { label, onclick }: { label: string; onclick: () => void } = $props();
	const level = treeViewLevel();
</script>

<button
	class="block w-full overflow-x-hidden pr-1 pl-5 text-left text-ellipsis hover:bg-black/25"
	style:padding-left="{4 + level * 8}px"
	{onclick}
>
	{label}
</button>
