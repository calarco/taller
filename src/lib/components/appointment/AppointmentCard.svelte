<script>
	import { slide } from 'svelte/transition';
	import { slideEnter, slideExit } from '$lib/motion.js';
	import { openDialog } from '$lib/shared.svelte.js';
	import Dialog from '$lib/components/Dialog.svelte';

	let { appointment } = $props();
	let dialog = $state();
</script>

{#snippet appointmentContent()}
	<article>
		<h5>
			{appointment?.description}
			{#if appointment?.carModel}
				<span>{appointment.carModel.carMake?.name} {appointment.carModel.name}</span>
			{/if}
		</h5>
	</article>
{/snippet}

<div class="card" in:slide={slideEnter} out:slide={slideExit}>
	{@render appointmentContent()}
	<button type="button" onclick={() => openDialog(dialog)} aria-label="Borrar el turno">
		<span class="icon delete"></span>
	</button>
	<Dialog bind:dialog title="¿Borrar turno?" action="?/deleteAppointment">
		<input type="hidden" name="appointmentId" value={appointment?.appointmentId} />
		{@render appointmentContent()}
	</Dialog>
</div>

<style>
	.card {
		position: relative;
		display: grid;
		grid-template-columns: 1fr auto;

		&:nth-child(2)::after {
			content: '';
			position: absolute;
			top: -1px;
			right: 0;
			left: 0;
			z-index: 0;
			border-top: 1px solid var(--border-variant);
		}

		&:last-child {
			> button {
				border-radius: 0 0 var(--border-radius) 0;
			}
		}

		> button {
			border: none;
			border-radius: 0px;

			&:not(:first-child)::after {
				content: '';
				position: absolute;
				top: 0;
				bottom: 0;
				left: -1px;
				border-left: 1px solid var(--border-variant);
			}
		}
	}

	article {
		min-height: 3rem;
		padding: 0.5rem 1rem;
		display: flex;
		align-items: center;

		> h5 > span {
			padding-left: 0.5rem;
			color: var(--on-background-variant);
			font-size: 0.9em;
		}
	}
</style>
