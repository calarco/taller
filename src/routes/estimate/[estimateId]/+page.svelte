<script>
	import { fly, blur } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { enhance } from '$app/forms';
	import { windowState } from '$lib/shared.svelte.js';
	import Section from '$lib/components/Section.svelte';
	import Dialog from '$lib/components/Dialog.svelte';

	let { data } = $props();

	let estimate = $derived(data.estimate || {});
	let dialog = $state();
</script>

<div class="panel" in:fly={{ y: '-1rem', duration: 300, easing: sineOut }} out:blur={{ amount: 32, duration: 250, easing: sineIn }}>
	{#key estimate.estimateId}
		<div class="container" in:fly={{ y: '-1rem', duration: 300, easing: sineOut }} out:blur={{ amount: 32, duration: 900, easing: sineIn }}>
			<div class="buttons">
				<a class="button" href="/" aria-label="cerrar">
					<span class="icon back"></span>
				</a>
				<button type="button" onclick={() => dialog.showModal()} aria-label="borrar">
					<span class="icon delete"></span>
				</button>
				<button
					type="button"
					onclick={() => {
						windowState.activeCard = 'estimate';
						windowState.id = estimate.estimateId;
					}}
					aria-label="editar"
				>
					<span class="icon edit"></span>
				</button>
				<form
					method="POST"
					action="?/sendEstimate"
					use:enhance={() => {
						windowState.loading = true;
						windowState.error = {};
						return async ({ result, update }) => {
							update({ reset: false });
							windowState.loading = false;
							if (result.type === 'success') {
								console.log('email sent');
							}
							if (result.type === 'failure' && result.data) {
								windowState.error = result.data;
							}
						};
					}}
				>
					<input type="hidden" name="estimateId" value={estimate.estimateId} />
					<input type="email" name="email" placeholder="Dirección de correo" value={estimate.email || ''} />
					<button type="submit" aria-label="editar">
						{#if estimate.email}
							<span class="icon mailok"></span>
						{:else}
							<span class="icon mailsend"></span>
						{/if}
					</button>
				</form>
			</div>
			<div class="estimate">
				<Section overlay={windowState.activeCard === 'estimate'} cards>
					<div class="content">
						{@html data.html}
					</div>
				</Section>
			</div>
			<Dialog bind:dialog title="¿Borrar presupuesto?" action="?/deleteEstimate">
				<input type="hidden" name="estimateId" value={estimate.estimateId} />
				<article>
					<div>
						{#if estimate.vehicleId.length === 6}
							<h4 class="vehicleId">{estimate.vehicleId?.slice(0, 3)}<span>{estimate.vehicleId?.slice(-3)}</span></h4>
						{:else if estimate.vehicleId.length === 7}
							<h4 class="vehicleId">{estimate.vehicleId?.slice(0, 2)}<span>{estimate.vehicleId?.slice(2, 5)}</span><span>{resultado.vehicleId?.slice(-2)}</span></h4>
						{:else}
							<h4 class="vehicleId">{estimate.vehicleId}</h4>
						{/if}
						{#if estimate.carModel}
							<small>{estimate.carModel?.carMake?.name} {estimate.carModel?.name}</small>
						{/if}
					</div>
					<p>{estimate.description}</p>
				</article>
			</Dialog>
		</div>
	{/key}
</div>

<style>
	.panel {
		grid-column-start: panel-right;
		grid-row-start: panel-top;
		pointer-events: none;
	}

	.container {
		pointer-events: auto;
		position: absolute;
		z-index: 600;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		border-radius: 4px;
		background: var(--surface-variant);
		display: grid;
		grid-template-rows: auto 1fr;
	}

	.buttons {
		position: relative;
		width: 100%;
		height: 3rem;
		border-radius: 4px 4px 0 0;
		overflow: hidden;
		display: grid;
		gap: 1px;
		grid-template-columns: 2fr 2fr 2fr 5fr;

		> a,
		> button {
			width: 100%;
			height: 3rem;
			padding: 0 1.5rem;
			border-radius: 0px;
			background: none;
			border: none;

			&:hover {
				cursor: pointer;
				background: var(--primary-variant);
			}

			&:not(:first-child)::after {
				content: '';
				position: absolute;
				top: 0;
				left: -1px;
				bottom: 0;
				border-left: var(--border-variant);
			}

			&:last-child {
				height: 100%;
				padding-left: 1.5rem;
				padding-right: calc(1.5rem + 8px);
				margin: 0;
				border-radius: 0 4px 0 0;
				border: none;
				color: var(--secondary);

				&:hover {
					cursor: pointer;
					background: var(--primary-variant);
				}
			}
		}

		> form {
			position: relative;
			display: grid;
			grid-template-columns: 1fr auto;

			&::after {
				content: '';
				position: absolute;
				top: 0;
				left: -1px;
				bottom: 0;
				border-left: var(--border-variant);
			}

			input {
				outline: none;
				border-radius: 0px;
				padding: 0 1rem;
			}

			button {
				position: absolute;
				top: 0.5rem;
				right: 0.5rem;
				bottom: 0.5rem;
				padding: 0.25rem 0.75rem;
			}
		}
	}

	.estimate {
		position: absolute;
		top: 3rem;
		right: 0;
		bottom: 0;
		left: 0;
		border-radius: 4px;
		border-top: var(--border-variant);
	}

	article {
		min-width: 40rem;
		padding: 1rem 1.5rem;
		display: flex;
		align-items: center;
		gap: 2rem;

		> div {
			min-width: 5rem;
			max-width: 8rem;
			display: grid;
			align-items: center;

			.vehicleId {
				font-size: 0.9em;

				span {
					margin-left: 0.25rem;
				}
			}

			small {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: pre;
				font-size: 0.75em;
				color: var(--on-background-variant);
			}
		}
	}
</style>
