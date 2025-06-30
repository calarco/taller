<script>
	import { page } from '$app/state';
	import { windowState } from '$lib/shared.svelte.js';
	import AppointmentForm from './AppointmentForm.svelte';
	import AppointmentCard from './AppointmentCard.svelte';

	let { date } = $props();

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	date.setHours(0, 0, 0, 0);
	const id = date.toISOString().substring(0, 10);
	const isCurrent = id === today.toISOString().substring(0, 10);
	const isWeekend = [0, 6].indexOf(date.getDay()) !== -1;
	let isCreate = $derived(windowState.activeCard === 'appointment' && windowState.id === id);
	let appointments = $derived(page.data.appointments?.filter((x) => new Date(x.date).toISOString().substring(0, 10) === id));

	let element;
	$effect(() => {
		if (isCreate && element?.getBoundingClientRect().y > 550) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	});
</script>

<div bind:this={element} class={['container', { isCreate }]}>
	<div class={['day', { isCurrent, isWeekend }]}>
		<h3>{date.getDate()}</h3>
		<p>{date.toLocaleDateString('default', { weekday: 'short' }).substring(0, 3)}</p>
	</div>
	<div class="list">
		<div class={['createCont', { isCreate }]}>
			{#if isCreate}
				<AppointmentForm {date} />
			{/if}
			<button
				type="button"
				onclick={() => {
					windowState.activeCard = 'appointment';
					windowState.id = id;
				}}
				aria-label="crear"
			>
				<span class="icon create"></span>
			</button>
		</div>
		{#each appointments as appointment (appointment.appointmentId)}
			<AppointmentCard {appointment} />
		{/each}
	</div>
</div>

<style>
	.container {
		position: relative;
		padding: 0.75rem 1.5rem;
		display: grid;
		align-items: start;
		grid-template-columns: 3rem 1fr;
		gap: 1.5rem;
		z-index: 10;
		transition: z-index 0.35s step-end;

		&:nth-child(2) {
			margin-top: 0.75rem;
		}

		&:last-child {
			margin-bottom: 0.75rem;
		}

		&.isCreate {
			position: sticky;
			top: 0;
			z-index: 1500;
			transition: z-index 0s;
		}
	}

	.day {
		position: relative;
		height: 3rem;
		padding: 0 0.5rem;
		text-transform: uppercase;
		text-align: center;
		display: grid;
		grid-template-rows: auto auto;

		&.isWeekend {
			h3,
			p {
				color: var(--on-background-variant);
			}
		}

		&.isCurrent {
			h3,
			p {
				color: var(--secondary);
			}
		}

		h3 {
			font: 400 1.25rem/1.75rem var(--font-family-alt);
		}

		p {
			font: 400 0.9rem/1.25rem var(--font-family-alt);
		}
	}

	.list {
		position: relative;
		border-radius: 4px;
		display: flex;
		flex-direction: column;
		outline: var(--border-variant);
	}

	.createCont {
		position: relative;
		height: 3rem;
		padding: 0 0 3rem 0;
		color: var(--primary);
		border-radius: 4px 4px 0px 0px;
		margin-bottom: 1px;

		&:last-child {
			margin-bottom: 0px;

			> button {
				border-radius: 4px;
			}
		}

		&.isCreate {
			z-index: 1500;
			box-shadow: none;
		}

		> button {
			border-radius: 4px 4px 0px 0px;
			position: relative;
			width: 100%;
			height: 3rem;
			overflow: hidden;
			color: inherit;
		}
	}
</style>
