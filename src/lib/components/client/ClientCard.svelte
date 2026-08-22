<script>
	import { page } from '$app/state';
	import { openForm, openDialog } from '$lib/shared.svelte.js';
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
					<div class="label">Teléfono</div>
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

<div class="card">
	{@render clientContent()}
	<div class="cardButtons">
		<button type="button" onclick={() => openDialog(dialog)} aria-label="Borrar el cliente">
			<span class="icon delete"></span>
		</button>
		<button type="button" onclick={() => openForm('client', client.clientId)} aria-label="Editar el cliente">
			<span class="icon edit"></span>
		</button>
	</div>
	<Dialog bind:dialog title="¿Borrar cliente y sus vehiculos?" action="?/deleteClient">
		<input type="hidden" name="clientId" value={client.clientId} />
		{@render clientContent()}
	</Dialog>
</div>

<style>
	.card {
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
		grid-template-columns: 1fr 1fr;
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

	.cardButtons {
		grid-row: 5;
		border-radius: 0;
		border-top: 1px solid var(--border);

		button {
			&:not(:first-child)::after {
				border-left: 1px solid var(--border);
			}
		}
	}
</style>
