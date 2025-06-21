<script>
	import { fade } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { windowState } from '$lib/shared.svelte.js';
	import Dialog from '$lib/components/Dialog.svelte';

	let dialog = $state();
	let url = $derived(page.url.pathname);
	let darkTheme = $derived(page.data.darkTheme);
	$effect(() => {
		if (url !== '/login') {
			if (darkTheme) {
				window.document.body.classList.add('dark-mode');
			} else {
				window.document.body.classList.remove('dark-mode');
			}
		} else {
			dialog.close();
		}
	});
</script>

<div class="bar">
	<div>
		<p class="label">© Calarco WEB</p>
		<form method="POST" action="?/switchTheme" use:enhance>
			<button type="submit" aria-label="borrar" onclick={() => window.document.body.classList.toggle('dark-mode')}>
				{#if page.data.darkTheme}
					<span class="icon lighton"></span>
				{:else}
					<span class="icon lightoff"></span>
				{/if}
			</button>
		</form>
		<button type="button" onclick={() => dialog.showModal()} aria-label="borrar">
			<span class="icon logout"></span>
		</button>
	</div>
	<Dialog bind:dialog title={`¿Cerrar la sesión de ${page.data.userId}?`} actionText="Cerrar sesión" action="?/logout" />
</div>
{#if windowState.loading}
	<div class="loading" in:fade={{ duration: 900, easing: sineOut }} out:fade={{ duration: 250, easing: sineIn }}>
		<div></div>
	</div>
{/if}

<style>
	.bar {
		width: 100vw;
		background: var(--surface-variant);
		border-top: var(--border-variant);
		box-shadow: var(--shadow-variant);
		display: grid;
		justify-items: center;

		> div {
			position: relative;
			width: 100%;
			max-width: 91rem;
			border-radius: 4px;
			overflow: hidden;
			background: var(--surface);
			box-shadow: var(--shadow);
			display: grid;
			grid-template-columns: 1fr auto auto;
			gap: 1px;

			p {
				position: relative;
				padding: 0 0.75rem;
				height: 100%;
				display: grid;

				&::after {
					content: '';
					position: absolute;
					top: 0;
					bottom: 0;
					right: -1px;
					border-right: var(--border-variant);
				}
			}

			button {
				height: 100%;
				margin: 0;
				padding: 0 1rem;
				border: none;
				border-radius: 0px;
				font: var(--label);
				font: 500 0.75rem/1.25rem var(--font-family);
				color: var(--primary);

				&:first-child:after {
					content: '';
					position: absolute;
					top: 0;
					bottom: 0;
					right: -1px;
					border-right: var(--border-variant);
				}

				.icon::before {
					width: 1.25rem;
					height: 1.25rem;
				}
			}
		}
	}

	@keyframes loading {
		0% {
			opacity: 0.2;
		}
		50% {
			opacity: 0.7;
		}
		100% {
			opacity: 0.2;
		}
	}

	@keyframes l16 {
		0% {
			background-position:
				-150% 0,
				-150% 0;
		}
		66% {
			background-position:
				250% 0,
				-150% 0;
		}
		100% {
			background-position:
				250% 0,
				250% 0;
		}
	}

	.loading {
		position: absolute;
		z-index: 2100;
		bottom: -5rem;
		height: 6rem;
		width: 100vw;
		display: grid;
		justify-items: center;
		filter: blur(1rem);
		pointer-events: none;

		> div {
			border-radius: 100%;
			width: 80vw;
			max-width: 75rem;
			--c: no-repeat linear-gradient(var(--secondary) 0 0);
			background: var(--c), var(--c);
			background-size: 60% 100%;
			animation: l16 3s ease-in-out infinite;
		}
	}
</style>
