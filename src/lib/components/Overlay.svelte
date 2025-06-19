<script>
	import { fade } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';

	let { close } = $props();
</script>

<div class="overlay" role="button" tabindex="0" aria-pressed="false" onkeyup={() => {}} onkeydown={() => {}} onclick={close} in:fade={{ duration: 300, easing: sineOut }} out:fade={{ duration: 250, easing: sineIn }}></div>

<style>
	.overlay {
		position: absolute;
		z-index: 1001;
		top: 0;
		right: 0;
		left: 0;
		border-radius: 4px;
		background: var(--overlay);
		backdrop-filter: blur(0.4rem);
		height: 1000%;
	}
</style>
