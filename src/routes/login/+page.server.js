import { loginUserAction, demoLoginAction } from '$lib/server/controllers/User.controller.js';

export const load = (event) => {
	return { landing: ['taller.calarco.com.ar', 'localhost', '127.0.0.1'].includes(event.url.hostname) };
};

export const actions = {
	login: loginUserAction,
	demo: demoLoginAction,
};
