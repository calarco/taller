import { createUserAction } from '$lib/server/controllers/User.controller.js';

export const actions = {
	default: async (event) => {
		return await createUserAction(event);
	},
};
