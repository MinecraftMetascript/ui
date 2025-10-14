<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon';
	import { Check, X } from '@steeze-ui/tabler-icons';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { initializeObservability } from './observability';

	const initConsent = async () => {
		await initializeObservability();
		shouldShow = false;
	};

	const acceptConsent = () => {
		localStorage.setItem('MMS:telemetry_consent', 'true');
		initConsent();
	};

	const declineConsent = () => {
		localStorage.setItem('MMS:telemetry_consent', 'false');
		shouldShow = false;
	};

	let shouldShow = $state(false);
	let timeout = $state(0);
	const TIMEOUT_MAX = 30000;
	let animateIdx = 0; // prevent multiple running when
	onMount(() => {
		const consent = localStorage.getItem('MMS:telemetry_consent');
		if (!consent) {
			shouldShow = true;
			timeout = TIMEOUT_MAX;
			let current = performance.now();
			const idx = ++animateIdx;
			const animate = () => {
				if (animateIdx !== idx) return;
				const elapsed = performance.now() - current;
				timeout -= elapsed;
				timeout = Math.max(timeout, 0);
				current = performance.now();
				if (timeout > 0) {
					requestAnimationFrame(animate);
				} else {
					console.log('Done?');
				}
			};
			animate();
		} else if (consent.toLowerCase() === 'true') {
			initConsent().catch(console.error);
		}
	});
</script>

{#if shouldShow}
	<div
		class="flex max-h-svh w-svw justify-between bg-slate-300 px-32 py-4"
		transition:slide={{ duration: 500, delay: 500 }}
	>
		<p>
			This website can leverage
			<a href="https://grafana.com/products/cloud/frontend-observability/" target="_blank"
				>Grafana Frontend Observability</a
			>
			to gather performance and error insights.
			<br />
			<strong
				>Your privacy is important to us, and this will NOT be activated unless you consent.</strong
			>
		</p>

		<div class="flex min-h-0 items-center gap-4">
			<button
				class="relative flex h-12 items-center gap-2 bg-green-400 px-4 py-1 text-lg font-bold text-green-950 hover:bg-green-600"
				onclick={() => acceptConsent()}
			>
				<Icon src={Check} class="size-6 stroke-4" />
				Accept
				<div class="absolute bottom-0 left-0 h-1 w-full bg-green-300">
					<div
						class="h-full bg-green-900"
						style:width="{100 - (timeout / TIMEOUT_MAX) * 100}%"
					></div>
				</div>
			</button>
			<button
				class="flex h-12 items-center gap-2 bg-red-400 px-4 py-1 text-lg text-red-950 hover:bg-red-600"
				onclick={() => declineConsent()}
			>
				<div class="relative">
					<Icon src={X} class="absolute top-1/2 left-1/2 h-4 w-4 -translate-1/2" />
				</div>
				Decline
			</button>
		</div>
	</div>
{/if}
