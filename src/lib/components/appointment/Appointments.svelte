<script>
	import { windowState } from '$lib/shared.svelte';
	import Section from '$lib/components/Section.svelte';
	import Day from './Day.svelte';

	function getCalendarMonth(lastYear, lastMonth) {
		const year = !lastYear ? new Date().getFullYear() : lastMonth === 11 ? lastYear + 1 : lastYear;
		const month = !lastMonth ? new Date().getMonth() : lastMonth === 11 ? 0 : lastMonth + 1;
		const date = lastMonth && lastYear ? 1 : new Date().getDate();

		const days = [];
		for (var i = date; i <= 32 - new Date(year, month, 32).getDate(); i++) {
			days.push(i);
		}

		return { year: year, month: month, days: days };
	}

	const calendar = $state([getCalendarMonth(), getCalendarMonth(new Date().getFullYear(), new Date().getMonth())]);

	function loadDays(e) {
		const options = {
			root: null,
			rootMargin: '20px',
			threshold: 0,
		};
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				const lastCalendar = calendar[calendar.length - 1];
				calendar.push(getCalendarMonth(lastCalendar.year, lastCalendar.month));
				observer.disconnect();
			}
		}, options);

		observer.observe(e);
	}
</script>

<div class="panel">
	<Section overlay={windowState.activeCard === 'appointment' || windowState.activeCard === 'client'}>
		{#each calendar as month (month.year + month.month)}
			<div use:loadDays>
				<div class="month">
					<h6>{month.year}</h6>
					<h4>
						{new Date(month.year, month.month, 1).toLocaleDateString('es-AR', { month: 'long' })}
					</h4>
				</div>
				{#each month.days as date (date)}
					<Day date={new Date(month.year, month.month, date)} />
				{/each}
			</div>
		{/each}
	</Section>
</div>

<style>
	.panel {
		position: relative;
		grid-column-start: panel-left;
		grid-row-start: panel-top;
		background: var(--surface-variant);
		outline: var(--border-variant);
		box-shadow: var(--shadow-variant);
	}

	.month {
		position: sticky;
		z-index: 900;
		top: -1px;
		margin-top: -1px;
		width: 100%;
		min-height: calc(3rem + 1px);
		padding: 0.5rem 2rem;
		border-top: var(--border-variant);
		background: var(--surface);
		box-shadow: var(--shadow);
		display: grid;
		gap: 2rem;
		grid-auto-flow: column;
		align-items: center;
		justify-content: start;
		text-transform: capitalize;

		h6 {
			color: var(--on-background-variant);
		}
	}
</style>
