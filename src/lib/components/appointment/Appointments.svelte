<script>
	import { fly } from 'svelte/transition';
	import { panelFlyEnterY, panelFlyExitY } from '$lib/motion.js';
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { windowState } from '$lib/shared.svelte';
	import { upcoming, past, appointmentsVersion, resetAppointments } from '$lib/appointments.svelte.js';
	import Section from '$lib/components/Section.svelte';
	import UpcomingList from './UpcomingList.svelte';
	import PastList from './PastList.svelte';

	let showPast = $state(false);

	$effect(() => {
		if (!page.data.user) {
			untrack(() => {
				showPast = false;
				resetAppointments();
			});
		}
	});
	$effect(() => {
		if (appointmentsVersion()) {
			untrack(() => {
				upcoming.reload();
				past.reload();
			});
		}
	});
</script>

<div class="panel">
	{#key `${showPast}${page.data.user?.userId ?? ''}`}
		<div class="panelFill" in:fly={panelFlyEnterY} out:fly={panelFlyExitY}>
			<Section overlay={windowState.form === 'appointment' || windowState.form === 'client'}>
				{#if showPast}
					<PastList />
				{:else}
					<UpcomingList />
				{/if}
			</Section>
		</div>
	{/key}
	<div class={['pastToggle', { isActive: showPast }]}>
		<button type="button" onclick={() => (showPast = !showPast)} aria-pressed={showPast} aria-label={showPast ? 'Ver turnos próximos' : 'Ver turnos anteriores'}>
			<span class="icon history"></span>
		</button>
	</div>
</div>

<style>
	.panel {
		position: relative;
		grid-column-start: panel-left;
		grid-row-start: panel-top;
		background: var(--surface-variant);
		outline: 1px solid var(--border);
		box-shadow: var(--shadow-variant);
		overflow: hidden;
	}

	.panelFill {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}

	.pastToggle {
		position: absolute;
		z-index: var(--layer-sticky);
		top: 0.25rem;
		right: 1.25rem;
		height: calc(2.5rem + 0px);
		border-radius: var(--border-radius);
		background: var(--surface);
		display: grid;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);

		&.isActive {
			background: var(--surface-variant);
			box-shadow: var(--shadow-variant-inset);

			> button {
				color: var(--secondary);
			}
		}

		> button {
			height: 100%;
		}
	}
</style>
