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
		<div>
			<div class="createCont">
				<button
					type="button"
					class="createButton"
					onclick={() => {
						windowState.activeCard = 'client';
						windowState.id = '';
					}}
					aria-label="crear"
					in:fade={{ duration: 150, easing: sineIn }}
					out:fade={{ duration: 200, easing: sineOut }}
				>
					<span class="icon client"></span>
				</button>
			</div>
			<div></div>
			<p class="label">© Calarco WEB</p>
		</div>
		<div>
			<div class="createCont">
				<button
					type="button"
					class="createButton"
					onclick={() => {
						windowState.activeCard = 'estimate';
						windowState.id = '';
					}}
					aria-label="crear"
					in:fade={{ duration: 150, easing: sineIn }}
					out:fade={{ duration: 200, easing: sineOut }}
				>
					<span class="icon estimate"></span>
				</button>
			</div>
			<div></div>
			<form method="POST" action="?/switchTheme" use:enhance>
				<button type="submit" aria-label="borrar" onclick={() => (darkTheme = !darkTheme)}>
					{#if darkTheme}
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
	</div>
</div>
<Dialog bind:dialog title={`¿Cerrar la sesión de ${page.data.userId}?`} actionText="Cerrar sesión" action="?/logout" />
{#if windowState.loading}
	<div class="loading" in:fade={{ duration: 900, easing: sineOut }} out:fade={{ duration: 250, easing: sineIn }}>
		<div></div>
	</div>
{/if}

<style>
	.bar {
		width: 100vw;
		display: grid;
		justify-items: center;

		> div {
			width: 100vw;
			max-width: 95rem;
			height: 100%;
			padding: 0 2rem;
			display: grid;
			gap: 2rem;
			grid-template-columns: [panel-left] 2fr [panel-right] 3fr;
			grid-template-rows: [panel-top] 1fr;

			@media (min-width: 1440px) {
				gap: 2rem;
			}

			> div {
				position: relative;
				border-radius: 0 0 4px 4px;
				background: var(--surface-variant);
				outline: var(--border-variant);
				box-shadow: var(--shadow-variant);
				display: grid;
				gap: 1px;

				&:first-child {
					grid-template-columns: auto 1fr auto;

					p {
						padding: 0 1rem;
						height: 100%;
						display: grid;
					}
				}

				&:last-child {
					grid-template-columns: auto 1fr auto auto;

					> form > button,
					> button {
						height: 100%;

						&:after {
							content: '';
							position: absolute;
							top: 0;
							bottom: 0;
							left: -1px;
							border-left: var(--border-variant);
						}
					}

					> button {
						border-radius: 0 0 4px 0;
					}
				}

				button {
					height: auto;
					margin: 0;
					padding: 0 1rem;
					border-radius: 0px;
					font: var(--label);
					font: 500 0.75rem/1.25rem var(--font-family);
					color: var(--primary);

					.icon::before {
						width: 1.25rem;
						height: 1.25rem;
					}
				}

				.createCont {
					position: relative;
					width: 6rem;

					.createButton {
						position: absolute;
						top: 0;
						bottom: -1px;
						left: -1px;
						right: -1px;
						border-radius: 0 0 5px 5px;
						backdrop-filter: none;
						box-shadow: none;
						border-top: none;

						&:hover {
							border-top: none;
						}
					}
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
