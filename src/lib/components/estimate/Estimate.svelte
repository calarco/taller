<script module>
	export const fontFamily = "'Supreme-Variable', 'Helvetica Neue', Helvetica, Arial, sans-serif";
</script>

<script>
	import { Container, Heading, Hr, Link, Text } from 'svelte-email';

	let { estimate, user } = $props();

	const styleToString = (style) => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) {
				return str;
			}
			return (
				str +
				key
					.split(/(?=[A-Z])/)
					.join('-')
					.toLowerCase() +
				':' +
				style[key] +
				';'
			);
		}, '');
	};

	const money = (value) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
	const number = (value) => new Intl.NumberFormat('es-AR').format(value || 0);
	const longDate = (value) => new Intl.DateTimeFormat('es-AR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(value));
	const plate = (value = '') => (value.length === 6 ? `${value.slice(0, 3)} ${value.slice(3)}` : value.length === 7 ? `${value.slice(0, 2)} ${value.slice(2, 5)} ${value.slice(5)}` : value);

	const rule = '1px solid rgba(128,128,128,0.2)';
	const muted = 'rgba(128,128,128,0.75)';

	let parts = $derived(estimate.parts ?? []);
	let total = $derived(Number(estimate.labor || 0) + parts.reduce((a, part) => a + Number(part.price || 0), 0));
	let details = $derived(
		[
			estimate.createdAt ? { label: 'Fecha', value: longDate(estimate.createdAt) } : null,
			estimate.vehicleId ? { label: 'Patente', value: plate(estimate.vehicleId) } : null,
			estimate.carModel ? { label: 'Modelo', value: `${estimate.carModel.carMake?.name ?? ''} ${estimate.carModel.name ?? ''}`.trim() } : null,
			estimate.km ? { label: 'KM', value: number(estimate.km) } : null,
		].filter(Boolean)
	);

	const sheet = { margin: '0 auto', padding: '1.5rem 1rem' };
	const text = { width: '100%', margin: '0', fontFamily, textAlign: 'center' };
	const tagline = { ...text, color: muted };
	const title = { width: '100%', margin: '0', padding: '0.75rem 0', fontFamily, textAlign: 'center' };
	const subtitle = { width: '100%', margin: '0', fontFamily, textAlign: 'center' };
	const summary = { ...text, padding: '0.25rem 0 1.5rem 0' };
	const footer = { width: '100%', margin: '0', padding: '0 0.5rem', fontFamily, textAlign: 'right' };
	const hr = { borderColor: 'rgba(128,128,128,0.2)', margin: '1rem 0' };
	const inline = styleToString({ padding: '0 0.5rem' });

	const detailsTable = { width: '100%', margin: '0 0 1rem 0', borderCollapse: 'separate', borderSpacing: '0' };
	const detailLabel = { padding: '0 1.5rem 0 0', fontFamily, fontSize: '12px', lineHeight: '16px', fontWeight: '500', color: muted, textAlign: 'left', whiteSpace: 'nowrap' };
	const detailValue = { padding: '0 1.5rem 0 0', fontFamily, fontSize: '14px', lineHeight: '20px', fontWeight: '300', textAlign: 'left' };

	const ledger = { width: '100%', margin: '1.5rem 0 2.5rem 0', border: rule, borderCollapse: 'separate', borderSpacing: '0' };
	const row = { pageBreakInside: 'avoid', breakInside: 'avoid' };

	const cell = { padding: '0.375rem 1.5rem', fontFamily, fontSize: '14px', lineHeight: '20px', fontWeight: '300', verticalAlign: 'top' };
	const amountCell = { ...cell, width: '100px', textAlign: 'center', borderRight: rule };
	const detailCell = { ...cell, width: '100%', textAlign: 'left' };
	const priceCell = { ...cell, width: '150px', textAlign: 'right', borderLeft: rule, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

	const head = { fontSize: '12px', lineHeight: '16px', fontWeight: '500', color: muted, borderBottom: rule, whiteSpace: 'nowrap' };
	const amountHead = { ...amountCell, ...head };
	const detailHead = { ...detailCell, ...head };
	const priceHead = { ...priceCell, ...head };

	const amountTotal = { ...amountCell, borderTop: rule };
	const detailTotal = { ...detailCell, borderTop: rule, textAlign: 'right', fontSize: '12px', lineHeight: '20px', fontWeight: '500', color: muted };
	const priceTotal = { ...priceCell, borderTop: rule, fontSize: '16px', fontWeight: '500' };
</script>

<Container style={sheet}>
	{#if user.description}
		<Text style={tagline}>
			{user.description}
		</Text>
	{/if}
	<Heading as="h1" style={title}>
		{user.name || user.userId}
	</Heading>
	<Text style={text}>
		{#if user.address}
			<span style={inline}>{user.address}</span>
		{/if}
		{#if user.phone}
			<span style={inline}>{user.phone}</span>
		{/if}
		{#if user.email}
			<span style={inline}>{user.email}</span>
		{/if}
	</Text>
	<Hr style={hr} />
	<Heading as="h2" style={subtitle}>Presupuesto</Heading>
	{#if estimate.description}
		<Text style={summary}>
			{estimate.description}
		</Text>
	{/if}
	{#if details.length}
		<table style={styleToString(detailsTable)} border="0" cellpadding="0" cellspacing="0" role="presentation">
			<tbody>
				<tr style={styleToString(row)}>
					{#each details as detail (detail.label)}
						<td style={styleToString(detailLabel)}>{detail.label}</td>
					{/each}
				</tr>
				<tr style={styleToString(row)}>
					{#each details as detail (detail.label)}
						<td style={styleToString(detailValue)}>{detail.value}</td>
					{/each}
				</tr>
			</tbody>
		</table>
	{/if}
	<table style={styleToString(ledger)} border="0" cellpadding="0" cellspacing="0">
		<thead>
			<tr style={styleToString(row)}>
				<th scope="col" style={styleToString(amountHead)}>Cantidad</th>
				<th scope="col" style={styleToString(detailHead)}>Detalle</th>
				<th scope="col" style={styleToString(priceHead)}>Importe ($)</th>
			</tr>
		</thead>
		<tbody>
			<tr style={styleToString(row)}>
				<td style={styleToString(amountCell)}>&nbsp;</td>
				<td style={styleToString(detailCell)}>Mano de obra</td>
				<td style={styleToString(priceCell)}>{money(estimate.labor)}</td>
			</tr>
			{#each parts as part (part.name)}
				<tr style={styleToString(row)}>
					<td style={styleToString(amountCell)}>{part.amount}</td>
					<td style={styleToString(detailCell)}>{part.name}</td>
					<td style={styleToString(priceCell)}>{money(part.price)}</td>
				</tr>
			{/each}
			<tr style={styleToString(row)}>
				<td style={styleToString(amountTotal)}>&nbsp;</td>
				<td style={styleToString(detailTotal)}>Total</td>
				<td style={styleToString(priceTotal)}>{money(total)}</td>
			</tr>
		</tbody>
	</table>
	<Hr style={hr} />
	<Text style={footer}>
		© <Link href="https://calarco.com.ar">CalarcoWEB</Link>
	</Text>
</Container>
