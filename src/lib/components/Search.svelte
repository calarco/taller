<script>
	import { slide, blur } from 'svelte/transition';
	import { blurEnter, blurExit, slideEnter, slideExit } from '$lib/motion.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { windowState } from '$lib/shared.svelte';
	import { createSearch } from '$lib/search.svelte.js';
	import Section from '$lib/components/Section.svelte';
	import Plate from '$lib/components/vehicle/Plate.svelte';

	const search = createSearch();

	let activeIndex = $state(-1);
	let results = $derived((search.results ?? page.data.search ?? []).map((x) => ({ ...x, updatedAt: new Date(x.updatedAt) })));
	const rows = $state([]);

	function select(index) {
		activeIndex = index;
		rows[index]?.scrollIntoView({ block: 'nearest' });
	}

	function onkeydown(e) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			select(results.length ? (activeIndex + 1) % results.length : -1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			select(results.length ? (activeIndex <= 0 ? results.length - 1 : activeIndex - 1) : -1);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const result = results[activeIndex] || results[0];
			if (result?.estimateId) {
				goto(`/estimate/${result.estimateId}`);
			} else if (result?.vehicleId) {
				goto(`/${result.clientId}/${result.vehicleId}${result.repairId ? '#' + result.repairId : ''}`);
			} else if (result) {
				goto(`/${result.clientId}`);
			}
		} else if (e.key === 'Escape') {
			search.value = '';
			activeIndex = -1;
		}
	}
</script>

<div class="panel">
	<Section overlay={windowState.form === 'estimate'}>
		<label class="searchBar">
			<div>
				{#if !search.value}
					<div in:blur={blurEnter} out:blur={blurExit}>
						<span class="icon search"></span>
					</div>
				{:else}
					<div class="close" in:blur={blurEnter} out:blur={blurExit}>
						<button
							type="button"
							onmousedown={(e) => {
								e.preventDefault();
								search.value = '';
								activeIndex = -1;
								document.getElementById('searchInput').focus();
							}}
							aria-label="borrar"
						>
							<span class="icon close"></span>
						</button>
					</div>
				{/if}
			</div>
			<input id="searchInput" type="search" name="search" placeholder="BUSCAR" autocomplete="off" bind:value={search.value} oninput={() => (activeIndex = -1)} {onkeydown} />
		</label>
		{#if !results.length && search.settled}
			<h5 class="empty" in:slide={slideEnter} out:slide={slideExit}>No se encontraron resultados</h5>
		{/if}
		{#each results as result, i (result.id)}
			<div bind:this={rows[i]} class={['result', { isSelected: i === activeIndex }]} in:slide={slideEnter} out:slide={slideExit}>
				{#if result.clientId}
					<div class="clientResult">
						<a href={`/${result.clientId}`} class={['clientLink', { isActive: result.clientId === page.url.pathname.split('/')[1] }, { isVehicle: result.vehicleId }]}>
							<div class="iconRow">
								<span class="icon client"></span>
								<h5>{result.clientName}</h5>
							</div>
						</a>
						{#if result.vehicleId}
							<a href={`/${result.clientId}/${result.vehicleId || ''}${result.repairId ? '#' + result.repairId : ''}`} class="vehicleLink">
								<div class="vehicleInfo iconRow">
									<span class="icon vehicle"></span>
									<div>
										<Plate vehicleId={result.vehicleId} />
										{#if result.carModel}
											<small>{result.carModel.carMake?.name} {result.carModel.name}</small>
										{/if}
									</div>
								</div>
								{#if result.repairId}
									<div class="repairInfo iconRow">
										<span class="icon repair"></span>
										<p>{result.description}</p>
									</div>
								{/if}
							</a>
						{/if}
					</div>
					<a href={`/${result.clientId}/${result.vehicleId || ''}${result.repairId ? '#' + result.repairId : ''}`} class="updatedAt">
						<div>
							{result.updatedAt.getDate()}/{result.updatedAt.toLocaleDateString('default', { month: 'short' }).substring(0, 3)}/{result.updatedAt
								.toLocaleDateString('default', { year: 'numeric' })
								.substring(2, 4)}
						</div>
						<div>
							{result.updatedAt.toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit',
								hour12: false,
							})}
						</div>
					</a>
				{/if}
				{#if result.estimateId}
					<a class="estimateResult" href={`/estimate/${result.estimateId}`}>
						<div class="estimateInfo iconRow">
							<span class="icon estimate"></span>
							<p>{result.description}</p>
						</div>
						{#if result.vehicleId}
							<div class="vehicleLink">
								<div class="vehicleInfo iconRow">
									<span class="icon vehicle"></span>
									<div>
										<Plate vehicleId={result.vehicleId} />
										{#if result.carModel}
											<small>{result.carModel.carMake?.name} {result.carModel.name}</small>
										{/if}
									</div>
								</div>
								{#if result.email}
									<div class="repairInfo iconRow">
										<span class="icon mail"></span>
										<p>{result.email}</p>
									</div>
								{/if}
							</div>
						{/if}
					</a>
					<a href={`/estimate/${result.estimateId}`} class="updatedAt">
						<div>
							{result.updatedAt.getDate()}/{result.updatedAt.toLocaleDateString('default', { month: 'short' }).substring(0, 3)}/{result.updatedAt
								.toLocaleDateString('default', { year: 'numeric' })
								.substring(2, 4)}
						</div>
						<div>
							{result.updatedAt.toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit',
								hour12: false,
							})}
						</div>
					</a>
				{/if}
			</div>
		{/each}
	</Section>
</div>

<style>
	.panel {
		grid-column-start: panel-right;
		grid-row-start: panel-top;
		background: var(--surface-variant);
		outline: 1px solid var(--border-variant);
		box-shadow: var(--shadow-variant);
	}

	.searchBar {
		position: sticky;
		z-index: var(--layer-sticky);
		top: 0;
		right: 0;
		left: 0;
		height: 3rem;
		margin-bottom: -1px;
		border-radius: var(--border-radius) 0 0 0;
		background: var(--surface);
		box-shadow: var(--shadow);
		display: grid;
		grid-template-columns: 3.5rem 1fr auto;
		align-items: center;

		span {
			margin-left: 0;
		}

		input[type='search'] {
			margin: 0;
			border: none;

			&:focus {
				border: none;
				box-shadow: none;
			}
		}

		> div {
			height: 100%;
			position: relative;
			display: grid;

			&::after {
				content: '';
				position: absolute;
				top: calc(50% - 1rem);
				right: -1px;
				height: 2rem;
				border-right: 1px solid var(--border-variant);
			}

			> div {
				position: absolute;
				top: 0;
				bottom: 0;
				left: 0;
				right: 0;
				display: grid;
				align-items: center;
				justify-items: center;
				cursor: text;

				button {
					height: 100%;

					&:hover {
						background: none;
					}
				}
			}

			> div.close:hover {
				background: var(--highlight);
			}

			.icon.search::before {
				background: var(--on-background-variant);
			}
		}
	}

	.empty {
		min-height: 4.5rem;
	}

	.result {
		position: relative;
		width: 100%;
		min-height: 4.5rem;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		transition: background-color var(--duration-fast) var(--ease-out);

		&:hover,
		&.isSelected {
			cursor: pointer;
			background: var(--highlight);
			transition: none;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: -1px;
			width: 100%;
			border-bottom: 1px solid var(--border-variant);
		}

		.icon::before {
			background: var(--on-background-variant);
		}

		.iconRow {
			display: grid;
			grid-template-columns: auto 1fr;
			gap: 1rem;
			align-items: center;
		}

		.vehicleLink {
			position: relative;
			flex-grow: 1000;
			padding: 0.5rem 0 0.5rem 1rem;
			display: flex;
			gap: 1rem;

			.vehicleInfo {
				min-width: 7.5rem;
				max-width: 7.5rem;
				flex-grow: 1;

				> div {
					display: grid;
					align-items: center;

					small {
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: pre;
						font-size: 0.75em;
						color: var(--on-background-variant);
					}
				}
			}

			.repairInfo {
				position: relative;
				flex-grow: 1000;

				p {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: pre;
					font-size: 0.8em;
				}
			}
		}

		> .clientResult {
			height: 100%;
			display: flex;
			gap: 1px;

			.clientLink {
				min-width: 40%;
				flex-grow: 1;
				padding: 0.5rem 0.5rem;
				display: grid;

				&.isVehicle:hover {
					div {
						outline: 1px solid var(--border-variant);
						transition: none;
					}
				}

				.iconRow {
					padding: 0.5rem 0.5rem;
					border-radius: var(--border-radius);
					transition: outline-color var(--duration-fast) var(--ease-out);
					outline: 1px solid rgba(0, 0, 0, 0);
					text-transform: capitalize;
				}

				.icon::before {
					transition: background-color var(--duration-fast) var(--ease-out);
				}

				h5 {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: pre;
					font-size: 0.9em;
					transition: color var(--duration-fast) var(--ease-out);
				}

				&.isActive {
					.icon::before {
						background: var(--secondary);
					}

					h5 {
						font-weight: bold;
						color: var(--secondary);
					}
				}
			}

			.vehicleLink {
				&::after {
					content: '';
					position: absolute;
					top: calc(50% - 1rem);
					left: -1px;
					height: 2rem;
					border-left: 1px solid var(--border-variant);
				}
			}
		}

		> .estimateResult {
			height: 100%;
			display: flex;
			gap: 1px;

			.estimateInfo {
				flex-grow: 1;
				min-width: 40%;
				padding: 0 1rem;
			}
		}

		> .updatedAt {
			height: 100%;
			position: relative;
			padding: 0 1rem;
			width: 6.25rem;
			text-align: right;
			text-transform: uppercase;
			font-family: var(--font-family-alt);
			color: var(--on-background-variant);
			display: grid;
			gap: 0.25rem;
			align-content: center;

			> div:first-child {
				font-size: 0.75em;
			}

			> div:last-child {
				font-size: 0.7em;
			}
		}
	}
</style>
