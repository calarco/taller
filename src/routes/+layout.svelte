<script>
	import { page, navigating } from '$app/state';
	import { windowState } from '$lib/shared.svelte.js';
	import Appointments from '$lib/components/appointment/Appointments.svelte';
	import Search from '$lib/components/Search.svelte';
	import Bar from '$lib/components/Bar.svelte';
	import ClientForm from '$lib/components/client/ClientForm.svelte';
	import '$lib/app.css';

	let { children } = $props();

	let url = $derived(page.url.pathname);
	$effect(() => {
		if (url) {
			windowState.activeCard = '';
			windowState.id = '';
			windowState.loading = false;
		}
	});
	$effect(() => {
		if (windowState.activeCard === '') {
			windowState.error = {};
		}
	});
	$effect(() => {
		if (navigating.to) {
			windowState.loading = true;
		} else {
			windowState.loading = false;
		}
	});
</script>

<svelte:head>
	<title>Sistema Taller</title>
	<meta name="description" content="Gestión de taller mecánico" />
</svelte:head>

<main>
	<div class="panels">
		<Appointments />
		<Search />
		{@render children()}
		{#if windowState.activeCard === 'client'}
			<div class="panel">
				<ClientForm />
			</div>
		{/if}
	</div>
	<Bar />
</main>

<style>
	main {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		display: grid;
		justify-content: center;
		justify-items: center;
		grid-template-rows: 1fr var(--bar-height);
	}

	.panels {
		width: 100vw;
		max-width: 95rem;
		height: 100%;
		padding: 1.5rem 2rem;
		display: grid;
		gap: 2rem;
		grid-template-columns: [panel-left] 2fr [panel-right] 3fr;
		grid-template-rows: [panel-top] 1fr;

		@media (min-width: 1440px) {
			padding: 1.5rem 2rem;
			gap: 2rem;
		}
	}

	.panel {
		grid-column-start: panel-left;
		grid-row-start: panel-top;
		pointer-events: none;
	}
</style>
