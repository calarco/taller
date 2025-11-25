<script>
	import { page } from '$app/state';
	import { windowState } from '$lib/shared.svelte.js';
	import Form from '$lib/components/Form.svelte';
	import Label from '$lib/components/Label.svelte';

	let client = $derived(windowState.id ? page.data.client : {});
</script>

<Form action="?/upsertClient" isCreate={!windowState.id} --grid-columns="1fr 1fr [end]">
	<input type="hidden" name="clientId" value={client.clientId || ''} />
	<Label title="Nombre" error={windowState.error?.nameError}>
		<input type="text" name="name" placeholder="-" autoComplete="off" value={client.name || ''} />
	</Label>
	<Label title="Apellido">
		<input type="text" name="lastName" placeholder="-" autoComplete="off" value={client.lastName || ''} />
	</Label>
	<Label title="DNI / CUIT / CUIL">
		<input style="text-transform: uppercase;" type="text" name="dni" placeholder="-" autoComplete="off" value={client.dni || ''} />
	</Label>
	<Label title="Empresa">
		<input type="text" name="work" placeholder="-" autoComplete="off" value={client.work || ''} />
	</Label>
	<Label title="Teléfono">
		<input type="tel" name="phone" pattern="\d*" placeholder="-" autoComplete="off" value={client.phone || ''} />
	</Label>
	<Label title="Correo electrónico">
		<input style="text-transform: lowercase;" type="email" name="email" placeholder="-" autoComplete="off" value={client.email || ''} />
	</Label>
</Form>
