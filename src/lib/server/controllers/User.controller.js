import { fail } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_KEY } from '$env/static/private';
import { getModel } from '$lib/server/db';
import { handleServerError } from '$lib/server/errors.js';
import { resetDemo } from '$lib/server/controllers/Demo.controller.js';

export function findUser(userId, filters) {
	const User = getModel(userId, 'User');
	return User.findOne(filters, { __v: 0 }).lean();
}

export function authenticate(cookies) {
	const token = cookies.get('auth-token');
	if (!token) {
		return;
	}
	try {
		return jwt.verify(token, JWT_KEY, { algorithms: ['HS256'] });
	} catch {
		return;
	}
}

export async function loginUserAction(event) {
	try {
		const form = await event.request.formData();
		const userId = (form.get('userId') || '').toLowerCase().trim();
		const password = form.get('password');
		if (!userId) {
			return fail(400, { userIdError: 'Ingrese el usuario' });
		}
		if (!password) {
			return fail(400, { passwordError: 'Ingrese la contraseña' });
		}
		const user = await findUser(userId, { userId });
		const passwordCorrect = await bcrypt.compare(password, user?.password || '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
		if (!user || !passwordCorrect) {
			return fail(400, { passwordError: 'Usuario o contraseña incorrecta' });
		}

		const token = jwt.sign({ id: user._id.toString(), userId: user.userId }, JWT_KEY, { expiresIn: '30d' });
		event.cookies.set('auth-token', token, {
			httpOnly: true,
			secure: true,
			path: '/',
			maxAge: 60 * 60 * 24 * 30,
		});
		event.cookies.delete('userId', { path: '/' });

		await resetDemo(userId);

		const message = 'Usuario ingresado';
		return { message };
	} catch (err) {
		handleServerError(err, 'loginUserAction');
	}
}

export async function editUserAction(event) {
	try {
		const userId = event.locals.userId;
		if (!userId) {
			return;
		}
		if (userId === 'demo') {
			return fail(400, { nameError: 'No disponible en la cuenta de demostración' });
		}

		const form = await event.request.formData();
		const user = {
			name: (form.get('name') || '').trim(),
			description: (form.get('description') || '').trim(),
			phone: (form.get('phone') || '').trim(),
			address: (form.get('address') || '').trim(),
			email: (form.get('email') || '').trim().toLowerCase(),
		};

		if (!user.name) {
			return fail(400, { nameError: 'Ingrese el nombre' });
		}

		const User = getModel(userId, 'User');
		const data = await User.findOneAndUpdate({ userId }, user, { new: true });
		const updated = JSON.parse(JSON.stringify(data));
		delete updated.password;
		return { user: updated };
	} catch (err) {
		handleServerError(err, 'editUserAction');
	}
}
