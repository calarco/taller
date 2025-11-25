<script>
	import { fade, blur, fly } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { page } from '$app/state';
	import { windowState } from '$lib/shared.svelte.js';
	import Dialog from '$lib/components/Dialog.svelte';
	import Label from '$lib/components/Label.svelte';

	let logoutDialog = $state();
	let settingsDialog = $state();
	let url = $derived(page.url.pathname.split('/'));
	let user = $derived(page.data.user || {});
	$effect(() => {
		if (url.length && url[1] === '/login') {
			logoutDialog.close();
		}
	});
</script>

<div class="bar">
	<div>
		<div>
			<div class="titleCont">
				{#if !url[1] || url[1] === 'estimate'}
					<div in:blur={{ amount: 16, duration: 200, easing: sineOut }} out:blur={{ amount: 16, duration: 150, easing: sineIn }}>
						<p>Turnos</p>
					</div>
				{:else}
					<div in:fly={{ y: '-1rem', duration: 300, easing: sineOut }} out:blur={{ amount: 32, duration: 250, easing: sineIn }}>
						<a class="button" href="/" aria-label="cerrar">
							<span class="icon back"></span>Cliente
						</a>
					</div>
				{/if}
			</div>
			<div class="createCont">
				<button
					type="button"
					class={['createButton', { isActive: windowState.form === 'client' }]}
					onclick={() => {
						if (windowState.form !== 'client') {
							windowState.form = 'client';
							windowState.id = '';
							windowState.data = {};
						}
					}}
					aria-label="crear"
				>
					<div>
						{#if windowState.form === 'client' && !windowState.id}
							<span class="icon create" in:blur={{ amount: 8, duration: 200, easing: sineOut }} out:blur={{ amount: 8, duration: 150, easing: sineIn }}> </span>
						{:else if windowState.form === 'client'}
							<span class="icon edit" in:blur={{ amount: 8, duration: 200, easing: sineOut }} out:blur={{ amount: 8, duration: 150, easing: sineIn }}> </span>
						{:else}
							<span class="icon client" in:blur={{ amount: 8, duration: 200, easing: sineOut }} out:blur={{ amount: 8, duration: 150, easing: sineIn }}> </span>
						{/if}
					</div>
					<span>Cliente</span>
				</button>
			</div>
			<p class="label">© Calarco WEB</p>
		</div>
		<div>
			<div class="titleCont">
				{#if url[1] === 'estimate'}
					<div in:fly={{ y: '-1rem', duration: 300, easing: sineOut }} out:blur={{ amount: 32, duration: 250, easing: sineIn }}>
						<a class="button" href="/" aria-label="cerrar">
							<span class="icon back"></span>Presupuesto
						</a>
					</div>
				{:else if url[2]}
					<div in:fly={{ x: '-1rem', duration: 300, easing: sineOut }} out:blur={{ amount: 32, duration: 900, easing: sineIn }}>
						<a class="button" href={`/${url[1]}`} aria-label="cerrar">
							<span class="icon back"></span>Reparaciones
						</a>
					</div>
				{:else}
					<div in:blur={{ amount: 16, duration: 200, easing: sineOut }} out:blur={{ amount: 16, duration: 150, easing: sineIn }}>
						<p>Recientes</p>
					</div>
				{/if}
			</div>
			<div class="createCont">
				<button
					type="button"
					class={['createButton', { isActive: windowState.form === 'estimate' }]}
					onclick={() => {
						if (windowState.form !== 'estimate') {
							windowState.form = 'estimate';
							windowState.id = '';
							windowState.data = {};
						}
					}}
					aria-label="crear"
				>
					<div>
						{#if windowState.form === 'estimate' && !windowState.id}
							<span class="icon create" in:blur={{ amount: 16, duration: 200, easing: sineOut }} out:blur={{ amount: 16, duration: 150, easing: sineIn }}> </span>
						{:else if windowState.form === 'estimate'}
							<span class="icon edit" in:blur={{ amount: 16, duration: 200, easing: sineOut }} out:blur={{ amount: 16, duration: 150, easing: sineIn }}> </span>
						{:else}
							<span class="icon estimate" in:blur={{ amount: 16, duration: 200, easing: sineOut }} out:blur={{ amount: 16, duration: 150, easing: sineIn }}> </span>
						{/if}
					</div>
					<span>Presupuesto</span>
				</button>
			</div>
			<div class="buttonsCont">
				<button type="button" onclick={() => settingsDialog.showModal()} aria-label="settings">
					<span>{user.name || user.userId}</span>
				</button>
				<button type="button" onclick={() => logoutDialog.showModal()} aria-label="borrar">
					<span class="icon logout"></span>
				</button>
			</div>
		</div>
	</div>
</div>
<Dialog bind:dialog={settingsDialog} title={user.userId} action="?/editUser" actionText="Guardar" --grid-columns="1fr 1fr [end]" --min-width="40rem">
	<Label title="Nombre" error={windowState.error?.nameError}>
		<input type="text" name="name" placeholder="-" autoComplete="off" value={user.name || ''} />
	</Label>
	<Label title="Dirección" error={windowState.error?.addressError}>
		<input type="text" name="address" placeholder="-" autoComplete="off" value={user.address || ''} />
	</Label>
	<Label title="Teléfono" error={windowState.error?.phoneError}>
		<input type="tel" name="phone" pattern="\d*" placeholder="-" autoComplete="off" value={user.phone || ''} />
	</Label>
	<Label title="Correo electrónico" error={windowState.error?.emailError}>
		<input style="text-transform: lowercase;" type="email" name="email" placeholder="-" autoComplete="off" value={user.email || ''} />
	</Label>
	<Label title="Descripción" error={windowState.error?.descriptionError} --column-end="span 2">
		<input type="text" name="description" placeholder="-" autoComplete="off" value={user.description || ''} />
	</Label>
</Dialog>
<Dialog bind:dialog={logoutDialog} title={`¿Cerrar la sesión de ${user.name || user.userId}?`} action="?/logout" actionText="Cerrar sesión" />
{#if windowState.loading}
	<div class="loading" in:fade={{ duration: 1800, easing: sineIn }} out:fade={{ duration: 250, easing: sineIn }}>
		<div></div>
		<div></div>
	</div>
{/if}

<style>
	.bar {
		z-index: 10;
		width: 100vw;
		display: grid;
		justify-items: center;

		> div {
			width: 100vw;
			max-width: 95rem;
			height: 100%;
			padding: 0 1rem;
			display: grid;
			gap: 1rem;
			grid-template-columns: [panel-left] 2fr [panel-right] 3fr;
			grid-template-rows: [panel-top] 1fr;

			> div {
				position: relative;
				border-radius: 0 0 var(--border-radius) var(--border-radius);
				background: var(--surface-variant);
				outline: 1px solid var(--border-variant);
				box-shadow: var(--shadow-variant);
				display: grid;
				gap: 1px;

				&:first-child {
					grid-template-columns: 1fr auto 1fr;

					.label {
						padding: 0 1rem;
						height: 100%;
						display: grid;
						text-align: right;
					}
				}

				&:last-child {
					grid-template-columns: 1fr auto 1fr;

					.buttonsCont {
						display: flex;
						justify-content: flex-end;
						gap: 1px;

						> button {
							height: 100%;
							padding: 0 1rem;
							border-radius: 0px;
							font: var(--label);
							font: 500 0.75rem/1.25rem var(--font-family);

							&:after {
								content: '';
								position: absolute;
								top: 0.5rem;
								bottom: 0.5rem;
								left: -1px;
								border-left: 1px solid var(--border-variant);
							}

							.icon::before {
								width: 1.25rem;
								height: 1.25rem;
							}
						}

						> button:last-child {
							border-radius: 0 0 var(--border-radius) 0;
						}
					}
				}

				.titleCont {
					height: 100%;
					display: grid;

					> div {
						height: 100%;
						position: absolute;
						display: flex;

						> .button {
							border-radius: 0 0 0 var(--border-radius);
							padding: 0 1.5rem 0 1rem;
							gap: 1rem;
							font-family: var(--font-family-alt);
						}

						> p {
							padding: 0 1.5rem;
							height: 100%;
							display: flex;
							align-items: center;
							font-family: var(--font-family-alt);
							color: var(--on-background-variant);
						}
					}
				}

				.createCont {
					position: relative;

					.createButton {
						border-radius: 0 0 var(--border-radius) var(--border-radius);
						box-shadow: none;
						border-top: none;

						> div {
							gap: 0.25rem;
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
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		display: grid;
		justify-items: center;
		pointer-events: none;

		> div {
			position: absolute;
			width: 100%;
			--c: no-repeat linear-gradient(var(--secondary) 0 0);
			background: var(--c), var(--c);
			background-size: 60% 100%;
			animation: l16 3s ease-in-out infinite;
		}

		> div:first-child {
			top: -5rem;
			height: 6rem;
			filter: blur(1rem);
			--c: no-repeat linear-gradient(var(--secondary-variant) 0 0);
		}

		> div:last-child {
			top: 0;
			height: 1px;
		}
	}
</style>
