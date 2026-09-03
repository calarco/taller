<script>
	import { Body, Head, Html, Preview } from 'svelte-email';
	import Estimate, { fontFamily } from './Estimate.svelte';

	let { estimate, user } = $props();

	const body = { margin: '0', padding: '0', fontFamily };
</script>

<Html lang="es">
	<Head />
	<Body style={body}>
		<Preview preview={estimate.description} />
		<Estimate {estimate} {user} />
	</Body>
</Html>
