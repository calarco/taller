<script>
	import { page, navigating } from '$app/state';
	import { windowState } from '$lib/shared.svelte.js';
	import Appointments from '$lib/components/appointment/Appointments.svelte';
	import Search from '$lib/components/Search.svelte';
	import Bar from '$lib/components/Bar.svelte';
	import ClientForm from '$lib/components/client/ClientForm.svelte';
	import EstimateForm from '$lib/components/estimate/EstimateForm.svelte';
	import '$lib/app.css';

	let { children } = $props();

	let url = $derived(page.url.pathname);
	$effect(() => {
		if (url) {
			windowState.form = '';
			windowState.id = '';
			windowState.data = {};
			windowState.loading = false;
		}
	});
	$effect(() => {
		if (typeof windowState.form === 'string') {
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
	<Bar />
	<div class="panels">
		<Appointments />
		<Search />
		{@render children()}
		{#if windowState.form === 'client'}
			<div class="panel client">
				<ClientForm />
			</div>
		{/if}
		{#if windowState.form === 'estimate'}
			<div class="panel estimate">
				<EstimateForm />
			</div>
		{/if}
	</div>
	<div id="print-container"></div>
</main>

<style>
	main {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		display: grid;
		justify-content: center;
		justify-items: center;
		grid-template-rows: var(--bar-height) 1fr;
	}

	.panels {
		width: 100vw;
		max-width: 95rem;
		height: 100%;
		padding: 1rem;
		display: grid;
		gap: 1rem;
		grid-template-columns: [panel-left] 2fr [panel-right] 3fr;
		grid-template-rows: [panel-top] 1fr;

		@media (min-width: 1440px) {
		}
	}

	.client {
		grid-column-start: panel-left;
		grid-row-start: panel-top;
		pointer-events: none;
	}

	.estimate {
		grid-column-start: panel-right;
		grid-row-start: panel-top;
		pointer-events: none;
	}

	#print-container {
		display: none;
		pointer-events: none;
		position: absolute;
		z-index: 9000;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background: #fff;
		color: #000;
		--on-background: #000;
	}

	@media print {
		@page {
			size: auto;
			margin: 0;
		}

		:global(body) {
			print-color-adjust: exact;
			visibility: hidden;
		}

		#print-container {
			display: block;
			visibility: visible;
		}
	}
</style>
