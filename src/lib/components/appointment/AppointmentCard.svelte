<script>
	import { slide } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { getCarName } from '$lib/shared.svelte';
	import Dialog from '$lib/components/Dialog.svelte';

	let { appointment } = $props();
	let dialog = $state();
</script>

{#snippet appointmentContent()}
	<article>
		<h5>{appointment?.description}</h5>
		<p>{getCarName(appointment?.carModelId)}</p>
	</article>
{/snippet}

<div class="container" in:slide={{ axis: 'y', duration: 200, easing: sineOut }} out:slide={{ axis: 'y', duration: 150, easing: sineIn }}>
	{@render appointmentContent()}
	<button type="button" onclick={() => dialog.showModal()} aria-label="borrar">
		<span class="icon delete"></span>
	</button>
	<Dialog bind:dialog title="¿Borrar turno?" action="?/deleteAppointment">
		<input type="hidden" name="appointmentId" value={appointment?.appointmentId} />
		{@render appointmentContent()}
	</Dialog>
</div>

<style>
	.container {
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
			border-top: var(--border-variant);
		}

		&:last-child {
			> button {
				border-radius: 0px 0px 4px 0px;
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
				border-left: var(--border-variant);
			}
		}
	}

	article {
		min-height: 3rem;
		padding: 0.5rem 1rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;

		p {
			color: var(--on-background-variant);
			font-size: 0.9em;
		}
	}
</style>
