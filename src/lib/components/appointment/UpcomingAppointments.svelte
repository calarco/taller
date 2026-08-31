<script>
	import MonthHeader from './MonthHeader.svelte';
	import Day from './Day.svelte';

	function getNextMonth(currentYear, currentMonth) {
		const now = new Date();
		const year = !currentYear ? now.getFullYear() : currentMonth === 11 ? currentYear + 1 : currentYear;
		const month = !currentMonth && currentMonth !== 0 ? now.getMonth() : currentMonth === 11 ? 0 : currentMonth + 1;
		const date = (currentMonth || currentMonth === 0) && currentYear ? 1 : now.getDate();

		const days = [];
		for (var i = date; i <= 32 - new Date(year, month, 32).getDate(); i++) {
			days.push(i);
		}

		return { year: year, month: month, days: days };
	}

	const calendar = $state([getNextMonth()]);

	function loadDays(e, month) {
		const options = {
			root: null,
			rootMargin: '20px',
			threshold: 0,
		};
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				const lastCalendar = calendar[calendar.length - 1];
				if (lastCalendar.year === month.year && lastCalendar.month === month.month) {
					calendar.push(getNextMonth(month.year, month.month));
				}
				observer.disconnect();
			}
		}, options);

		observer.observe(e);

		return {
			destroy() {
				observer.disconnect();
			},
		};
	}
</script>

{#each calendar as month (`${month.year}${month.month}`)}
	<div use:loadDays={month}>
		<MonthHeader year={month.year} month={month.month} />
		{#each month.days as date (date)}
			<Day date={new Date(month.year, month.month, date)} />
		{/each}
	</div>
{/each}
