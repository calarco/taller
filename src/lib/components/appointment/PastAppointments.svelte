<script>
	import { page } from '$app/state';
	import MonthHeader from './MonthHeader.svelte';
	import Day from './Day.svelte';

	let months = $derived.by(() => {
		const groups = [];
		for (const appointment of page.data.pastAppointments ?? []) {
			const date = new Date(appointment.date);
			const year = date.getUTCFullYear();
			const month = date.getUTCMonth();
			const day = date.getUTCDate();

			let group = groups[groups.length - 1];
			if (!group || group.year !== year || group.month !== month) {
				group = { year: year, month: month, days: [] };
				groups.push(group);
			}
			if (group.days[group.days.length - 1] !== day) {
				group.days.push(day);
			}
		}
		return groups;
	});
</script>

{#each months as month (`${month.year}${month.month}`)}
	<div>
		<MonthHeader year={month.year} month={month.month} />
		{#each month.days as day (day)}
			<Day date={new Date(month.year, month.month, day)} />
		{/each}
	</div>
{/each}
{#if !months.length}
	<h5 class="empty">No hay turnos anteriores</h5>
{/if}

<style>
	.empty {
		min-height: 4.5rem;
		padding: 1.5rem;
		text-align: center;
		color: var(--on-background-variant);
	}
</style>
