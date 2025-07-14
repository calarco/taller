<script>
	import { fade, fly, blur } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { page } from '$app/state';
	import { windowState } from '$lib/shared.svelte.js';
</script>

<div class="container" in:fade={{ duration: 300, easing: sineOut }} out:fade={{ duration: 250, easing: sineIn }}>
	<div in:fly={{ y: '-1rem', duration: 200, easing: sineOut }} out:blur={{ amount: 32, duration: 150, easing: sineIn }}>
		<div>
			<a
				class="button"
				href="/"
				aria-label="cerrar"
				onclick={() => {
					windowState.form = '';
					windowState.id = '';
				}}
			>
				<span class="icon close"></span>
			</a>
			<h4>ERROR</h4>
		</div>
		<h4>{page.error.message}</h4>
	</div>
</div>

<style>
	.container {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		bottom: 0;
		min-height: 3rem;
		z-index: 2000;
		display: grid;
		justify-items: center;
		align-items: center;
		background: var(--overlay);
		backdrop-filter: blur(0.5rem);

		> div {
			width: 40rem;
			border-radius: 4px;
			overflow: hidden;
			background: var(--error);
			box-shadow: var(--shadow);
			outline: var(--border-variant);
			display: grid;
			grid-template-columns: auto 1fr;
			align-items: center;
			grid-template-columns: auto;
			grid-template-rows: auto 1fr;

			> div {
				display: grid;
				grid-template-columns: auto 1fr 3.5rem;
				justify-items: center;
				align-items: center;
				border-bottom: 1px solid var(--on-foreground-variant);

				a {
					border-radius: 0px;
					height: 100%;
					border-right: 1px solid var(--on-foreground-variant);

					.icon::before {
						background: var(--on-foreground);
					}
				}
			}

			h4 {
				padding: 0.5rem 1rem;
				color: var(--on-foreground);
				text-align: center;
				user-select: text;
			}
		}
	}
</style>
