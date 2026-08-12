export const windowState = $state({
	form: '',
	id: '',
	data: {},
	loading: false,
	error: {},
});

let pending = 0;

export function startLoading() {
	pending += 1;
	windowState.loading = true;
}

export function endLoading() {
	pending = Math.max(0, pending - 1);
	windowState.loading = pending > 0;
}

export function openForm(form, id = '', data = {}) {
	windowState.form = form;
	windowState.id = id;
	windowState.data = data;
	windowState.error = {};
}

export function closeForm() {
	openForm('');
}

export function openDialog(dialog) {
	closeForm();
	dialog?.showModal();
}

function pad(value) {
	return String(value).padStart(2, '0');
}

export function toLocalISODate(date) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toISODate(date) {
	return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}
