<script>
	import { slide } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { page } from '$app/state';
	import { windowState } from '$lib/shared.svelte.js';
	import Card from '$lib/components/Card.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import RepairForm from '$lib/components/repair/RepairForm.svelte';

	let { repair } = $props();

	let isActive = $derived(page.url.hash === `#${repair?.repairId}`);
	let dialog = $state();
</script>

{#snippet repairContent()}
	<article>
		<div class="title">
			<h5>
				{Intl.DateTimeFormat('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }).format(repair?.date)}
				{#if repair?.km}
					<small>{new Intl.NumberFormat('es-AR').format(repair.km)} km</small>
				{/if}
			</h5>
			<h4>{repair?.description}</h4>
			<p>{repair?.detail}</p>
		</div>
		<div class="details">
			<div>
				<p>${new Intl.NumberFormat('es-AR').format((repair?.cost || 0) + (repair?.labor || 0))}</p>
				<div class="label">TOTAL</div>
			</div>
			<div>
				<p>${new Intl.NumberFormat('es-AR').format(repair?.labor || 0)}</p>
				<div class="label">Mano de obra</div>
			</div>
			<div>
				<p>${new Intl.NumberFormat('es-AR').format(repair?.cost || 0)}</p>
				<div class="label">Repuestos</div>
			</div>
		</div>
	</article>
{/snippet}

<Card {isActive} isForm={windowState.form === 'repair' && windowState.id === repair?.repairId}>
	<a href={isActive ? `#` : `#${repair.repairId}`}>
		{@render repairContent()}
	</a>
	{#if isActive}
		<div class="cardButtons" in:slide={{ axis: 'y', duration: 200, easing: sineOut }} out:slide={{ axis: 'y', duration: 150, easing: sineIn }}>
			<button type="button" onclick={() => dialog.showModal()} aria-label="borrar">
				<span class="icon delete"></span>
			</button>
			<button
				type="button"
				onclick={() => {
					windowState.form = 'repair';
					windowState.id = repair.repairId;
				}}
				aria-label="editar"
			>
				<span class="icon edit"></span>
			</button>
		</div>
		{#if windowState.form === 'repair' && windowState.id === repair.repairId}
			<RepairForm {repair} />
		{/if}
		<Dialog bind:dialog title="¿Borrar reparación?" action="?/deleteRepair">
			<input type="hidden" name="repairId" value={repair?.repairId} />
			{@render repairContent()}
		</Dialog>
	{/if}
</Card>

<style>
	article {
		padding: 1rem 1.5rem;
		min-width: 40rem;
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1rem;

		.title {
			display: grid;
			gap: 0.5rem;
			align-content: start;
		}

		.details {
			display: grid;
			justify-items: end;
			align-content: start;
			gap: 1rem;

			> div {
				position: relative;
				display: grid;
				grid-template-columns: 1fr 5rem;
				gap: 0.5rem 0.75rem;
				align-items: center;

				&:first-child::after {
					content: '';
					position: absolute;
					bottom: -0.5rem;
					right: 0;
					width: 5.25rem;
					border-bottom: var(--border-variant);
				}

				&:first-child p {
					font-size: 1em;
				}

				p {
					font-family: var(--font-family-alt);
					font-size: 0.8em;
				}
			}
		}
	}
</style>
