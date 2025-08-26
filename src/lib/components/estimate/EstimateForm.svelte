<script>
	import { slide } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { page } from '$app/state';
	import { windowState } from '$lib/shared.svelte.js';
	import Form from '$lib/components/Form.svelte';
	import Label from '$lib/components/Label.svelte';
	import CarForm from '$lib/components/CarForm.svelte';

	let estimate = $derived(windowState.id ? page.data.estimate : {});
	let labor = $derived(estimate.labor || '');
	let parts = $derived(estimate.parts || []);
	let amount = $state('');
	let name = $state('');
	let price = $state('');
	let total = $derived(labor + parts.reduce((a, { price }) => a + price, 0));
</script>

<Form action="?/upsertEstimate" --grid-columns="2fr 5fr 3fr [end]">
	{#if estimate?.estimateId}
		<input type="hidden" name="estimateId" value={estimate.estimateId} />
	{/if}
	<Label title="Patente" error={windowState.error?.vehicleIdError}>
		<input class="patente" type="text" name="vehicleId" placeholder="-" autoComplete="off" value={estimate.vehicleId || ''} />
	</Label>
	<CarForm carModelProp={estimate?.carModelId} --flow="row" --row-end="span 1" />
	<Label title="Total" --template-columns="max-content 1fr">
		<h6 class="unit">$</h6>
		<h5 class="precio">{new Intl.NumberFormat('es-AR').format(total)}</h5>
	</Label>
	<Label title="KM">
		<input type="number" min="0" name="km" placeholder="-" autoComplete="off" value={estimate.km || ''} />
	</Label>
	<Label title="Descripción" error={windowState.error?.descriptionError}>
		<input type="text" name="description" placeholder="-" autoComplete="off" value={estimate.description || ''} />
	</Label>
	<Label title="Mano de obra" --template-columns="max-content 1fr">
		<h6 class="unit">$</h6>
		<input type="number" min="1" name="labor" placeholder="0" autoComplete="off" bind:value={labor} class="precio" />
	</Label>
	<fieldset>
		<div class="parts">
			<ul>
				{#each parts as part (part.name)}
					<li in:slide={{ axis: 'y', duration: 150, easing: sineOut }} out:slide={{ axis: 'y', duration: 150, easing: sineIn }}>
						<div>
							<p>{part.amount}</p>
						</div>
						<div>
							<p>{part.name}</p>
						</div>
						<input type="hidden" name="part" value={JSON.stringify(part)} />
						<div>
							<p class="precio"><span>$</span>{new Intl.NumberFormat('es-AR').format(part.price)}</p>
							<button type="button" onclick={() => (parts = parts.filter((x) => x.name !== part.name))} aria-label="borrar">
								<span class="icon delete"></span>
							</button>
						</div>
					</li>
				{/each}
				{#if !parts.length}
					<li in:slide={{ axis: 'y', duration: 150, easing: sineIn }} out:slide={{ axis: 'y', duration: 150, easing: sineOut }}>
						<h5 class="empty">Sin repuestos</h5>
					</li>
				{/if}
			</ul>
		</div>
		<Label title="Cantidad">
			<input type="number" min="0" name="amount" placeholder="1" bind:value={amount}/>
		</Label>
		<Label title="Repuesto" error={windowState.error?.nameError}>
			<input type="text" name="name" placeholder="-" autoComplete="off" bind:value={name} />
		</Label>
		<Label title="Precio" --template-columns="max-content 1fr auto">
			<h6 class="unit">$</h6>
			<input type="number" min="0" name="price" placeholder="0" bind:value={price} class="precio" />
			<button
				type="button"
				onclick={() => {
					if (name === '') {
						windowState.error = { nameError: 'Ingrese un repuesto' };
					} else if (parts.find((x) => x.name === name)) {
						windowState.error = { nameError: 'Repuesto ya ingresado' };
					} else {
						parts = [...parts, { amount: amount || 1, name, price: price || 0 }];
						amount = name = price = '';
						windowState.error = {};
					}
				}}
				aria-label="crear"
			>
				<span class="icon create"></span>
			</button>
		</Label>
	</fieldset>
</Form>

<style>
	.patente {
		text-transform: uppercase;
		font-family: var(--font-family-alt);
	}

	.precio {
		font-family: var(--font-family-alt);

		> span {
			margin-right: 1rem;
			font-family: var(--font-family-alt);
			color: var(--on-background-variant);
		}
	}

	fieldset {
		grid-column-end: span 3;
		height: 100%;
		background: var(--surface);
		display: grid;
		grid-template-columns: 2fr 5fr 3fr;

		button {
			padding: 0.25rem 0.5rem;
		}

		.parts {
			grid-column-end: span 3;
			padding: 0.75rem 1rem 1px 1rem;

			ul {
				min-height: 2.5rem;
				max-height: 20rem;
				overflow: auto;
				margin: 0;
				padding: 0;
				background: var(--surface);
				border-radius: 4px;
				outline: var(--border-variant);
				display: grid;
				align-content: space-between;
				font: var(--label);
				color: var(--on-background-variant);

				li {
					height: 2.5rem;
					display: grid;
					grid-template-columns: 2fr 5fr 3fr;

					&:last-child {
						button {
							border-radius: 0;
						}
					}

					> div {
						position: relative;
						display: flex;
						align-items: center;

						&:first-child {
							p {
								padding: 0 34px 0 1rem;
							}

							&::after {
								content: '';
								position: absolute;
								top: 0;
								right: 9px;
								bottom: 0;
								border-right: var(--border-variant);
							}
						}

						&:last-child {
							p {
								padding: 0 1rem 0 1.5rem;
							}

							&::after {
								content: '';
								position: absolute;
								top: 0;
								left: 6px;
								bottom: 0;
								border-left: var(--border-variant);
							}
						}

						p {
							padding: 0 1rem;
							flex-grow: 1;
						}

						button {
							height: 100%;
							border-radius: 0;

							&::after {
								content: '';
								position: absolute;
								top: 0;
								bottom: 0;
								left: -1px;
								border-left: 1px solid var(--primary-variant);
							}
						}
					}

					.empty {
						grid-column-end: span 3;

						&::after {
							border: none;
						}
					}
				}
			}
		}
	}
</style>
