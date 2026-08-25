<script>
	import { fly, blur } from 'svelte/transition';
	import { blurEnter, blurExit, panelBlurExit, panelFlyEnterX, panelFlyExitX } from '$lib/motion.js';
	import { enhance } from '$app/forms';
	import { windowState, openForm, openDialog } from '$lib/shared.svelte.js';
	import { enhanceSubmit } from '$lib/forms.js';
	import Section from '$lib/components/Section.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import Plate from '$lib/components/vehicle/Plate.svelte';

	let { data } = $props();

	let estimate = $derived(data.estimate || {});
	let isDemo = $derived(data.user?.userId === 'demo');
	let dialog = $state();
	let printContent = $state();
</script>

<div class="panel" in:fly={panelFlyEnterX} out:blur={panelBlurExit}>
	{#key estimate.estimateId}
		<div class="panelFill" in:fly={panelFlyEnterX} out:fly={panelFlyExitX}>
			<div class="buttons">
				<button type="button" onclick={() => openDialog(dialog)} aria-label="Borrar el presupuesto">
					<span class="icon delete"></span>
				</button>
				<button type="button" onclick={() => openForm('estimate', estimate.estimateId)} aria-label="Editar el presupuesto">
					<span class="icon edit"></span>
				</button>
				<button
					type="button"
					onclick={() => {
						const printContainer = document.getElementById('printContainer');
						printContainer.innerHTML = printContent.innerHTML;
						const cleanup = () => {
							printContainer.innerHTML = '';
							window.removeEventListener('afterprint', cleanup);
						};
						window.addEventListener('afterprint', cleanup);
						window.print();
					}}
					aria-label="Imprimir el presupuesto"
				>
					<span class="icon print"></span>
				</button>
				<form method="POST" action="?/sendEstimate" title={isDemo ? 'No disponible en la cuenta de demostración' : undefined} use:enhance={enhanceSubmit({ reset: false })}>
					<input type="hidden" name="estimateId" value={estimate.estimateId} />
					<input type="email" name="email" placeholder="Dirección de correo" value={estimate.email || ''} disabled={isDemo} />
					<button type="submit" aria-label="Enviar el presupuesto" disabled={isDemo}>
						{#if estimate.email}
							<span class="icon mailok" in:blur={blurEnter} out:blur={blurExit}></span>
						{:else}
							<span class="icon mailsend" in:blur={blurEnter} out:blur={blurExit}></span>
						{/if}
					</button>
				</form>
			</div>
			<div class="estimate">
				<Section overlay={windowState.form === 'estimate'} cards --section-radius="0 0 var(--border-radius) var(--border-radius)">
					<div bind:this={printContent}>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- rendered by svelte/server, already escaped -->
						{@html data.html}
					</div>
				</Section>
			</div>
			<Dialog bind:dialog title="¿Borrar presupuesto?" action="?/deleteEstimate">
				<input type="hidden" name="estimateId" value={estimate.estimateId} />
				<article>
					<div>
						<Plate vehicleId={estimate.vehicleId} />
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

	.panelFill {
		pointer-events: auto;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		border-radius: var(--border-radius);
		background: var(--surface-variant);
		display: grid;
		grid-template-rows: auto 1fr;
	}

	.buttons {
		position: relative;
		width: 100%;
		height: 3rem;
		border-radius: var(--border-radius) var(--border-radius) 0 0;
		overflow: hidden;
		display: grid;
		gap: 1px;
		grid-template-columns: 2fr 2fr 2fr 5fr;

		> button {
			width: 100%;
			height: 3rem;
			padding: 0 1.5rem;
			border-radius: 0px;
			background: none;
			border: none;

			&:hover {
				cursor: pointer;
				background: var(--highlight);
			}

			&:not(:first-child)::after {
				content: '';
				position: absolute;
				top: 0;
				left: -1px;
				bottom: 0;
				border-left: 1px solid var(--border);
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
				border-left: 1px solid var(--border);
			}

			input {
				outline: none;
				border-radius: 0px;
				padding: 0 1rem;
			}

			button {
				border-radius: 0px;
				min-width: 4rem;
				padding: 0 1rem;
				color: var(--primary);

				&::after {
					content: '';
					position: absolute;
					top: 0.5rem;
					left: -1px;
					bottom: 0.5rem;
					border-left: 1px solid var(--border);
				}

				.mailsend {
					padding-top: 3px;
				}

				.icon {
					position: absolute;
				}
			}
		}
	}

	.estimate {
		position: absolute;
		top: 3rem;
		right: 0;
		bottom: 0;
		left: 0;
		border-radius: 0 0 var(--border-radius) var(--border-radius);
		border-top: 1px solid var(--border);
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
