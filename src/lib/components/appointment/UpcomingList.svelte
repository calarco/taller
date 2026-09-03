<script>
	import { page } from '$app/state';
	import { toISODate } from '$lib/shared.svelte.js';
	import { upcoming } from '$lib/appointments.svelte.js';
	import { MONTHS_PER_BLOCK, onVisible } from '$lib/paging.js';
	import MonthHeader from './MonthHeader.svelte';
	import Day from './Day.svelte';

	function monthStart(date, offset = 0) {
		return new Date(Date.UTC(date.getFullYear(), date.getMonth() + offset, 1));
	}

	function monthDays(year, month, from) {
		const days = [];
		const last = new Date(year, month + 1, 0).getDate();
		for (let day = from; day <= last; day++) {
			days.push(day);
		}
		return days;
	}

	function nextBlock(after) {
		const now = new Date();
		const year = after ? after.year : now.getFullYear();
		const month = after ? after.month + 1 : now.getMonth();
		const first = after ? 1 : now.getDate();

		const months = [];
		for (let offset = 0; offset < MONTHS_PER_BLOCK; offset++) {
			const date = new Date(year, month + offset, 1);
			months.push({ year: date.getFullYear(), month: date.getMonth(), days: monthDays(date.getFullYear(), date.getMonth(), offset ? 1 : first) });
		}

		const anchor = new Date(year, month, 1);
		return { months, from: monthStart(anchor), to: monthStart(anchor, MONTHS_PER_BLOCK) };
	}

	const blocks = $state([nextBlock()]);
	let busy = false;

	let byDay = $derived.by(() => {
		const days = {};
		for (const appointment of [...(page.data.appointments ?? []), ...upcoming.extra]) {
			const id = toISODate(new Date(appointment.date));
			if (days[id]) {
				days[id].push(appointment);
			} else {
				days[id] = [appointment];
			}
		}
		return days;
	});

	async function loadNext() {
		if (busy) {
			return;
		}
		busy = true;
		try {
			const months = blocks[blocks.length - 1].months;
			const block = nextBlock(months[months.length - 1]);
			await upcoming.loadBlock(block.from, block.to);
			blocks.push(block);
		} finally {
			busy = false;
		}
	}
</script>

{#each blocks as block, index (index)}
	{#each block.months as month (`${month.year}${month.month}`)}
		<div>
			<MonthHeader year={month.year} month={month.month} />
			{#each month.days as date (date)}
				<Day date={new Date(month.year, month.month, date)} {byDay} />
			{/each}
		</div>
	{/each}
{/each}
<div class="sentinel" use:onVisible={loadNext}></div>
