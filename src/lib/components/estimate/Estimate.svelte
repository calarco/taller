<script>
	import { Column, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from 'svelte-email';

	let { estimate } = $props();
	let user = 'gabi';
</script>

<Html lang="en">
	<Head />
	<Preview preview={estimate.description} />
	<Container align="center" style={{ maxWidth: '100%', margin: '1rem' }}>
		<Heading as="h5">
			{user === 'montiel' ? 'Inyeccion Electronica - Airbag - ABS - Alarmas - Accesorios' : 'SERVICIO ESPECIALIZADO FORD'}
		</Heading>
	</Container>
	<Container align="center" style={{ maxWidth: '100%' }}>
		<Heading as="h1">
			{user === 'montiel' ? 'Taller Montiel' : 'Gabriel Mezzanotte'}
		</Heading>
	</Container>
	<Container align="center" style={{ maxWidth: '100%', marginBottom: '1rem' }}>
		<Text>
			{user === 'montiel' ? 'Vertiz 8190 - (0223) 155-063679 - montielelectroauto@gmail.com' : 'La Pampa 2265 - (0223) 475-2335 - gabimezzanotte@gmail.com (7600) Mar del Plata'}
		</Text>
	</Container>
	<Hr />
	<Container style={{ maxWidth: '100%', margin: '1rem' }}>
		<Heading as="h4">
			Presupuesto - {Intl.DateTimeFormat('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }).format(estimate.createdAt)}
		</Heading>
	</Container>
	<Section>
		<Column>
			<Text>Patente</Text>
		</Column>
		<Column>
			<Text>Vehiculo</Text>
		</Column>
		<Column>
			<Text>Km</Text>
		</Column>
	</Section>
	<Section>
		<Column>
			<Text>{estimate.vehicleId}</Text>
		</Column>
		<Column>
			<Text>{estimate.carModel.carMake.name} {estimate.carModel.name}</Text>
		</Column>
		<Column>
			<Text align="right">{estimate.km}</Text>
		</Column>
	</Section>
	<Container style={{ maxWidth: '100%', margin: '1rem' }}>
		<Heading as="h4">
			{estimate.description}
		</Heading>
	</Container>
	<Hr />
	<Container style={{ maxWidth: '100%' }}>
		<Text align="right" style={{ width: '100%', padding: '0 2rem' }}>
			© 2025 <Link href="https://calarco.com.ar">CalarcoWEB</Link>
		</Text>
	</Container>
</Html>

<style>
</style>
