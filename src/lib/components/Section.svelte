<script>
	import { fade } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { windowState } from '$lib/shared.svelte.js';

	let { overlay, children, cards } = $props();
</script>

<section class={[{ notOverlay: !overlay, cards }]}>
	{@render children()}
	{#if cards}
		<div class="padding"></div>
	{/if}
	{#if overlay}
		<button
			type="button"
			class="overlay"
			aria-label="cerrar"
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
		display: flex;
		flex-direction: column;
		gap: 1px;
		border-right: var(--scrollbar-width) solid rgba(0, 0, 0, 0.08);
		overflow-y: hidden;

		&.cards {
			background: var(--surface);
			box-shadow: var(--shadow);
			padding: 0 1rem;
			gap: 0;

			.padding {
				min-height: 15rem;
			}
		}

		&.notOverlay {
			border-right: 0px solid rgba(0, 0, 0, 0.08);
			overflow-y: scroll;
			animation: 0.25s delay-overflow step-end;
		}
	}

	@keyframes delay-overflow {
		from {
			border-right: var(--scrollbar-width) solid rgba(0, 0, 0, 0.08);
			overflow-y: hidden;
		}
	}

	.overlay {
		position: absolute;
		z-index: 1001;
		top: 0;
		right: 0;
		left: 0;
		padding: 0;
		border-radius: 0;
		background: var(--overlay);
		backdrop-filter: blur(0.5rem);
		height: 1000%;

		&:hover,
		&:focus {
			background: var(--overlay);
		}
	}
</style>
