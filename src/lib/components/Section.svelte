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
		<div class="overlay" role="button" tabindex="0" aria-pressed="false" onkeyup={() => {}} onkeydown={() => {}} onclick={() => {
			windowState.form = '';
			windowState.id = '';
		}} in:fade={{ duration: 300, easing: sineOut }} out:fade={{ duration: 250, easing: sineIn }}></div>
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
		border-radius: 4px;
		display: flex;
		flex-direction: column;
		gap: 1px;
		border-right: 12px solid rgba(0, 0, 0, 0.08);
		overflow-y: hidden;

		&.cards {
			background: var(--surface);
			box-shadow: var(--shadow);
			padding: 1.5rem;
			padding-left: calc(1.5rem + 12px);
			gap: 1.5rem;

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
			border-right: 12px solid rgba(0, 0, 0, 0.08);
			overflow-y: hidden;
		}
	}

	.overlay {
		position: absolute;
		z-index: 1001;
		top: 0;
		right: 0;
		left: 0;
		background: var(--overlay);
		backdrop-filter: blur(0.4rem);
		height: 1000%;
	}
</style>
