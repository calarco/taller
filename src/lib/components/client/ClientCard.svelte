<script>
	import { page } from '$app/state';
	import { windowState } from '$lib/shared.svelte.js';
	import Dialog from '$lib/components/Dialog.svelte';

	let client = $derived(page.data.client || {});
	let dialog = $state();
</script>

{#snippet clientContent()}
	<article>
		<div class="title">
			<h2>{client.name} {client.lastName}</h2>
			{#if client.work}
				<p>{client.work}</p>
			{/if}
		</div>
		<div class="details">
			{#if client.dni}
				<div>
					<p>{new Intl.NumberFormat('es-AR').format(client.dni)}</p>
					<div class="label">DNI</div>
				</div>
			{/if}
			{#if client.phone}
				<div>
					<p>{client.phone}</p>
					<div class="label">Telefono</div>
				</div>
			{/if}
			{#if client.email}
				<div>
					<p>{client.email}</p>
					<div class="label">E-Mail</div>
				</div>
			{/if}
		</div>
	</article>
{/snippet}

<div class="container">
	<div class="buttons">
		<a class="button" href="/" aria-label="cerrar">
			<span class="icon back"></span>
		</a>
		<button type="button" onclick={() => dialog.showModal()} aria-label="borrar">
			<span class="icon delete"></span>
		</button>
		<button
			type="button"
			onclick={() => {
				windowState.form = 'client';
				windowState.id = client.clientId;
			}}
			aria-label="editar"
		>
			<span class="icon edit"></span>
		</button>
	</div>
	{@render clientContent()}
	<Dialog bind:dialog title="¿Borrar cliente y sus vehiculos?" action="?/deleteClient">
		<input type="hidden" name="clientId" value={client.clientId} />
		{@render clientContent()}
	</Dialog>
</div>

<style>
	.container {
		position: relative;
		top: 0;
		grid-column-start: 1;
		grid-column-end: 1;
		grid-row-start: 1;
	}

	article {
		padding: 1rem 1.5rem;
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr auto;
		align-items: center;

		.title {
			display: grid;
			gap: 0.5rem;
			align-content: center;
			user-select: text;

			h2 {
				text-transform: capitalize;
			}
		}

		.details {
			display: grid;
			justify-items: end;
			gap: 0.5rem;
			user-select: text;

			> div {
				display: grid;
				grid-template-columns: 1fr 3rem;
				gap: 0.5rem 0.75rem;
				align-items: center;
			}
		}
	}

	.buttons {
		grid-row: 5;
		grid-column-start: 1;
		grid-column-end: span 3;
		position: relative;
		width: 100%;
		height: 3rem;
		border-radius: 4px 4px 0 0;
		overflow: hidden;
		border-bottom: var(--border-variant);
		display: grid;
		gap: 1px;
		grid-template-columns: 2fr 2fr 2fr;
		grid-auto-flow: column;

		a,
		button {
			width: 100%;
			height: 3rem;
			padding: 0 1.5rem;
			border-radius: 0px;
			background: none;
			border: none;

			&:hover {
				cursor: pointer;
				background: var(--primary-variant);
			}

			&:not(:first-child)::after {
				content: '';
				position: absolute;
				top: 0;
				left: -1px;
				bottom: 0;
				border-left: var(--border-variant);
			}

			&:last-child {
				height: 100%;
				padding-left: 1.5rem;
				padding-right: calc(1.5rem + 8px);
				margin: 0;
				border-radius: 0 4px 0 0;
				border: none;
				color: var(--secondary);

				&:hover {
					cursor: pointer;
					background: var(--primary-variant);
				}
			}
		}
	}
</style>
