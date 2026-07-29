const empty = { carMakes: [], carModels: [] };

export const load = async ({ fetch, data }) => {
	const response = await fetch('/cars');
	if (!response.ok) {
		return { ...data, ...empty };
	}
	try {
		return { ...data, ...(await response.json()) };
	} catch {
		return { ...data, ...empty };
	}
};
