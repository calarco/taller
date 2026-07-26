<script>
	import { fade } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { windowState } from '$lib/shared.svelte.js';

	let { overlay, children, cards } = $props();
</script>

<section class={[{ cards }]}>
	<div class={['scroller', { notOverlay: !overlay }]}>
		{@render children()}
		{#if cards}
			<div class="padding"></div>
		{/if}
	</div>
	{#if overlay}
		<button
			type="button"
			class="overlay"
			aria-label="cerrar"
			tabindex="-1"
			onclick={() => {
				windowState.form = '';
				windowState.id = '';
				windowState.data = {};
			}}
			in:fade={{ duration: 300, easing: sineOut }}
			out:fade={{ duration: 250, easing: sineIn }}
		></button>
	{/if}
</section>

<style>
	section {
		content-visibility: auto;
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 25rem;
		max-height: 100%;
		border-radius: var(--border-radius);

		&.cards {
			background: var(--surface);
			box-shadow: var(--shadow);

			.scroller {
				padding: 0 1rem;
				gap: 0;
			}

			.padding {
				min-height: 15rem;
			}
		}
	}

	.scroller {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 1px;
		border-radius: var(--border-radius);
		scrollbar-gutter: stable;
		overflow-y: hidden;

		&.notOverlay {
			overflow-y: scroll;
		}
	}

	.overlay {
		position: absolute;
		z-index: 1001;
		inset: 0;
		padding: 0;
		border-radius: 0;
		background: var(--overlay);
		backdrop-filter: blur(0.5rem);
	}
</style>
