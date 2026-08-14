<script>
	import { fade, fly, blur } from 'svelte/transition';
	import { blurExit, flyEnter, panelEnter, panelExit } from '$lib/motion.js';
	import { page } from '$app/state';
	import { closeForm } from '$lib/shared.svelte.js';
</script>

<div class="cover" in:fade={panelEnter} out:fade={panelExit}>
	<div in:fly={flyEnter} out:blur={blurExit}>
		<div>
			<a class="button" href="/" aria-label="Volver al inicio" onclick={closeForm}>
				<span class="icon close"></span>
			</a>
			<h4>ERROR {page.status}</h4>
		</div>
		<h4>{page.error.message}</h4>
	</div>
</div>

<style>
	.cover {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		bottom: 0;
		min-height: 3rem;
		z-index: var(--layer-cover);
		display: grid;
		justify-items: center;
		align-items: center;
		background: var(--overlay);
		backdrop-filter: blur(0.5rem);

		> div {
			width: 40rem;
			border-radius: var(--border-radius);
			overflow: hidden;
			background: var(--error);
			box-shadow: var(--shadow);
			outline: 1px solid var(--border-variant);
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
