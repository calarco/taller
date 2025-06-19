<script>
	import { windowState } from '$lib/shared.svelte.js';
	import Form from '$lib/components/Form.svelte';
	import Label from '$lib/components/Label.svelte';
	import CarForm from '$lib/components/CarForm.svelte';

	let { date } = $props();
</script>

<Form action="?/createAppointment">
	<input type="hidden" name="date" value={date} />
	<Label title="Descripción" error={windowState.error?.descriptionError}>
		<input type="text" name="description" placeholder="-" autoComplete="off" />
	</Label>
	<CarForm />
</Form>
