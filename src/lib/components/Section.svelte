<script>
	import { fade } from 'svelte/transition';
	import { enter, exit } from '$lib/motion.js';
	import { closeForm } from '$lib/shared.svelte.js';

	let { overlay, children, cards } = $props();
</script>

<section class={[{ cards }]}>
	<div class={['scroller', { notOverlay: !overlay }]}>
		{@render children()}
	</div>
	{#if overlay}
		<button type="button" class="overlay" aria-label="Cerrar el formulario" tabindex="-1" onclick={closeForm} in:fade={enter} out:fade={exit}></button>
	{/if}
</section>

<style>
	section {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 25rem;
		max-height: 100%;
		border-radius: var(--section-radius, var(--border-radius));

		&.cards {
			.scroller {
				padding: 0 0.5rem;
				gap: 0;
				scrollbar-gutter: stable both-edges;
			}
		}
	}

	.scroller {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 1px;
		border-radius: var(--section-radius, var(--border-radius));
		scrollbar-gutter: stable;
		overflow-y: hidden;

		&.notOverlay {
			overflow-y: auto;
		}
	}

	.overlay {
		position: absolute;
		z-index: var(--layer-scrim);
		inset: 0;
		padding: 0;
		border-radius: var(--section-radius, var(--border-radius));
		background: var(--overlay);
		backdrop-filter: blur(0.5rem);
	}
</style>
