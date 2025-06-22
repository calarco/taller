<script>
	import { slide, blur } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { page } from '$app/state';
	import { getCarName } from '$lib/shared.svelte';
	import Section from '$lib/components/Section.svelte';

	let value = $state('');
	let search = $state(page.data.search);
	$effect(() => {
		if (value) {
			(async () => {
				const response = await fetch('/search/' + value);
				const data = await response.json();
				if (data?.length) {
					data.forEach((x) => {
						x.updatedAt = new Date(x.updatedAt);
					});
					search = data;
				} else {
					search = [];
				}
			})();
		} else {
			search = page.data.search;
		}
	});
</script>

<div class="panel">
	<Section>
		<label class="buscador">
			<div>
				{#if !value}
					<div in:blur={{ amount: 16, duration: 200, easing: sineOut }} out:blur={{ amount: 16, duration: 150, easing: sineIn }}>
						<span class="icon search"></span>
					</div>
				{:else}
					<div class="close" in:blur={{ amount: 16, duration: 200, easing: sineOut }} out:blur={{ amount: 16, duration: 150, easing: sineIn }}>
						<button
							type="button"
							onmousedown={(e) => {
								e.preventDefault();
								value = '';
								document.getElementById('searchInput').focus();
							}}
							aria-label="borrar"
						>
							<span class="icon close"></span>
						</button>
					</div>
				{/if}
			</div>
			<input id="searchInput" type="search" name="search" placeholder="Buscar" autocomplete="off" bind:value />
		</label>
		{#if !search?.length}
			<h5 class="empty" in:slide={{ axis: 'y', duration: 200, easing: sineOut }} out:slide={{ axis: 'y', duration: 150, easing: sineIn }}>No se encontraron resultados</h5>
		{/if}
		{#each search as resultado (resultado.id)}
			<div class="result" in:slide={{ axis: 'y', duration: 200, easing: sineOut }} out:slide={{ axis: 'y', duration: 150, easing: sineIn }}>
				<div class="cliente">
					<a href={`/${resultado.clientId}`} class={['clienteCont', { isActive: resultado.clientId === page.url.pathname.split('/')[1] }, { isVehicle: resultado.vehicleId }]}>
						<div>
							<span class="icon client"></span>
							<h5>{resultado.clientName}</h5>
						</div>
					</a>
					{#if resultado.vehicleId}
						<a href={`/${resultado.clientId}/${resultado.vehicleId || ''}${resultado.repairId ? '#' + resultado.repairId : ''}`} class="vehiculo">
							<div class="vehiculoCont">
								<span class="icon vehicle"></span>
								<div>
									{#if resultado.vehicleId.length === 6}
										<h4 class="vehicleId">{resultado.vehicleId?.slice(0, 3)}<span>{resultado.vehicleId?.slice(-3)}</span></h4>
									{:else if resultado.vehicleId.length === 7}
										<h4 class="vehicleId">{resultado.vehicleId?.slice(0, 2)}<span>{resultado.vehicleId?.slice(2, 5)}</span><span>{resultado.vehicleId?.slice(-2)}</span></h4>
									{:else}
										<h4 class="vehicleId">{resultado.vehicleId}</h4>
									{/if}
									<small>{getCarName(resultado.carModelId)}</small>
								</div>
							</div>
							{#if resultado.repairId}
								<div class="reparacionCont">
									<span class="icon repair"></span>
									<p>{resultado.description}</p>
								</div>
							{/if}
						</a>
					{/if}
				</div>
				<a href={`/${resultado.clientId}/${resultado.vehicleId || ''}${resultado.repairId ? '#' + resultado.repairId : ''}`} class="updatedAt">
					<div>
						{resultado.updatedAt.toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
							hour12: false,
						})}
					</div>
					<div>
						{resultado.updatedAt.getDate()}/{resultado.updatedAt.toLocaleDateString('default', { month: 'short' }).substring(0, 3)}/{resultado.updatedAt
							.toLocaleDateString('default', { year: 'numeric' })
							.substring(2, 4)}
					</div>
				</a>
			</div>
		{/each}
	</Section>
</div>

<style>
	.panel {
		grid-column-start: panel-right;
		grid-row-start: panel-top;
		background: var(--surface-variant);
		outline: var(--border-variant);
		box-shadow: var(--shadow-variant);
	}

	.buscador {
		position: sticky;
		z-index: 100;
		top: 0;
		right: 0;
		left: 0;
		height: 3rem;
		border-radius: 4px 0 0 0;
		background: var(--surface);
		box-shadow: var(--shadow);
		display: grid;
		grid-template-columns: 3.5rem 1fr;
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
				border-right: var(--border-variant);
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
				background: var(--primary-variant);
			}

			.icon.search::before {
				background: var(--on-background-variant);
			}
		}
	}

	.empty {
		padding: 1.5rem;
	}

	.result {
		position: relative;
		width: 100%;
		min-height: 4.5rem;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		transition: 0.1s ease-in;

		&:hover {
			cursor: pointer;
			background: var(--primary-variant);
			transition: 0.15s ease-out;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: -1px;
			width: 100%;
			border-bottom: var(--border-variant);
		}

		.icon::before {
			background: var(--on-background-variant);
		}

		> .cliente {
			height: 100%;
			display: flex;
			gap: 1px;

			.clienteCont {
				min-width: 40%;
				flex-grow: 1;
				padding: 0.5rem 0.5rem;
				display: grid;

				&.isVehicle:hover {
					div {
						outline: var(--border-variant);
						transition: 0.15s ease-out;
					}
				}

				> div {
					padding: 0.5rem 0.5rem;
					border-radius: 4px;
					display: grid;
					grid-template-columns: auto 1fr;
					gap: 1rem;
					align-items: center;
					transition: 0.1s ease-in;
					outline: 1px solid rgba(0, 0, 0, 0);
				}

				.icon::before {
					transition: 0.1s ease-in;
				}

				h5 {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: pre;
					font-size: 0.9em;
					transition: 0.1s ease-in;
				}

				&.isActive {
					.icon::before {
						background: var(--secondary);
						transition: 0.15s ease-out;
					}

					h5 {
						font-weight: bold;
						color: var(--secondary);
						transition: 0.15s ease-out;
					}
				}
			}

			> .vehiculo {
				position: relative;
				flex-grow: 1000;
				padding: 0.5rem 1rem;
				display: flex;
				gap: 2rem;

				.vehiculoCont {
					min-width: 7.5rem;
					max-width: 7.5rem;
					flex-grow: 1;
					display: grid;
					grid-template-columns: auto 1fr;
					gap: 1rem;
					align-items: center;

					.vehicleId {
						font-size: 0.9em;
					}

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

				.reparacionCont {
					position: relative;
					flex-grow: 1000;
					display: grid;
					grid-template-columns: auto 1fr;
					gap: 1rem;
					align-items: center;

					p {
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: pre;
						font-size: 0.8em;
					}

					&::after {
						content: '';
						position: absolute;
						top: calc(50% - 1rem);
						left: -1rem;
						height: 2rem;
						border-left: var(--border-variant);
					}
				}

				&::after {
					content: '';
					position: absolute;
					top: calc(50% - 1rem);
					left: -1px;
					height: 2rem;
					border-left: var(--border-variant);
				}
			}
		}

		> .updatedAt {
			height: 100%;
			position: relative;
			padding: 0 1rem;
			width: 6rem;
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

			&::after {
				content: '';
				position: absolute;
				top: calc(50% - 1rem);
				left: -1px;
				height: 2rem;
				border-left: var(--border-variant);
			}
		}
	}
</style>
