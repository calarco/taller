import { page } from '$app/state';

export const windowState = $state({
	activeCard: '',
	id: '',
	loading: false,
	error: {},
});

export function getCarName(carModelId) {
	const carModel = page.data.carModels?.find((x) => x.carModelId === carModelId);
	const carMake = page.data.carMakes?.find((x) => x.carMakeId === carModel?.carMakeId);
	if (carModel && carMake) {
		return carMake.name + ' ' + carModel.name;
	} else {
		return '';
	}
}
