<script>
	import { windowState, openForm, toLocalISODate } from '$lib/shared.svelte.js';
	import { holidays } from '$lib/holidays.js';
	import AppointmentForm from './AppointmentForm.svelte';
	import AppointmentCard from './AppointmentCard.svelte';

	let { date, byDay } = $props();

	let today = $derived(toLocalISODate(new Date()));
	let id = $derived(toLocalISODate(date));
	let isCurrent = $derived(id === today);
	let past = $derived(id < today);
	let isWeekend = $derived([0, 6].indexOf(date.getDay()) !== -1);
	let isHoliday = $derived(holidays(date.getFullYear()).has(id));
	let isCreate = $derived(!past && windowState.form === 'appointment' && windowState.id === id);
	let appointments = $derived(byDay[id] ?? []);

	let element;
	$effect(() => {
		if (isCreate && element?.getBoundingClientRect().y > 550) {
			const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			element.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
		}
	});
</script>

<div bind:this={element} class={['dayRow', { isCreate }]}>
	<div class={['day', { isCurrent, isWeekend, isHoliday }]}>
		<h3>{date.getDate()}</h3>
		<p>{date.toLocaleDateString('es-AR', { weekday: 'short' }).substring(0, 3)}</p>
	</div>
	<div class="list">
		{#if !past}
			<div class={['createSlot', { isCreate }]}>
				{#if isCreate}
					<AppointmentForm date={id} />
				{/if}
				<button type="button" onclick={() => openForm('appointment', id)} aria-label="Crear un turno">
					<span class="icon create"></span>
				</button>
			</div>
		{/if}
		{#each appointments as appointment (appointment.appointmentId)}
			<AppointmentCard {appointment} />
		{/each}
	</div>
</div>

<style>
	.dayRow {
		position: relative;
		padding: 0.75rem 0.5rem 0.75rem 1rem;
		display: grid;
		align-items: start;
		grid-template-columns: 2.5rem 1fr;
		gap: 1rem;
		z-index: 1;
		transition: z-index var(--duration-panel-out) step-end;

		&:nth-child(2) {
			margin-top: 0.75rem;
		}

		&:last-child {
			margin-bottom: 0.75rem;
		}

		&.isCreate {
			position: sticky;
			top: 0;
			z-index: var(--layer-form);
			transition: none;
		}
	}

	.day {
		position: relative;
		height: 3rem;
		text-transform: uppercase;
		text-align: center;
		display: grid;
		grid-template-rows: auto auto;

		&.isWeekend,
		&.isHoliday {
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
		border-radius: var(--border-radius);
		display: flex;
		flex-direction: column;
		outline: 1px solid var(--border);
	}

	.createSlot {
		position: relative;
		height: 3rem;
		padding: 0 0 3rem 0;
		color: var(--primary);
		border-radius: var(--border-radius) var(--border-radius) 0 0;
		margin-bottom: 1px;

		&:last-child {
			margin-bottom: 0px;

			> button {
				border-radius: var(--border-radius);
			}
		}

		&:not(:last-child)::after {
			content: '';
			position: absolute;
			z-index: 0;
			right: 0;
			bottom: -1px;
			left: 0;
			border-bottom: 1px solid var(--border);
		}

		&.isCreate {
			z-index: var(--layer-form);
			box-shadow: none;
		}

		> button {
			border-radius: var(--border-radius) var(--border-radius) 0 0;
			position: relative;
			width: 100%;
			height: 3rem;
			overflow: hidden;
			color: inherit;
		}
	}
</style>
