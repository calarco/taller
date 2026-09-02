<script>
	import { untrack } from 'svelte';
	import { toISODate } from '$lib/shared.svelte.js';
	import { past } from '$lib/appointments.svelte.js';
	import { onVisible } from '$lib/paging.js';
	import MonthHeader from './MonthHeader.svelte';
	import Day from './Day.svelte';

	$effect(() => {
		if (!past.loaded) {
			untrack(() => past.loadMore());
		}
	});

	let byDay = $derived.by(() => {
		const days = {};
		for (const appointment of past.items) {
			const id = toISODate(new Date(appointment.date));
			if (days[id]) {
				days[id].push(appointment);
			} else {
				days[id] = [appointment];
			}
		}
		return days;
	});

	let months = $derived.by(() => {
		const groups = [];
		for (const appointment of past.items) {
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
			<Day date={new Date(month.year, month.month, day)} {byDay} />
		{/each}
	</div>
{/each}
{#if past.loaded && !months.length}
	<h5 class="empty">No hay turnos anteriores</h5>
{/if}
{#if past.hasMore}
	<div class="sentinel" use:onVisible={past.loadMore}></div>
{/if}
