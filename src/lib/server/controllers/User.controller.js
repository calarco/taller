import { error, fail } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_KEY } from '$env/static/private';
import { getModel } from '$lib/server/db';

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

		const message = 'Usuario ingresado';
		return { message };
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
}

export async function createUserAction(event) {
	try {
		if (!event.locals.userId) {
			return;
		}

		const form = await event.request.formData();
		const userId = (form.get('userId') || '').toLowerCase().trim();
		const password = form.get('password');

		if (!userId) {
			return fail(400, { userIdError: 'Ingrese el usuario' });
		}
		if (!password) {
			return fail(400, { passwordError: 'Ingrese la contraseña' });
		}
		const existing = await findUser(userId, { userId });
		if (existing) {
			return fail(400, { userIdError: 'El usuario ya existe' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const User = getModel(userId, 'User');
		const data = await User.create({ userId, password: hashedPassword });
		return { data: JSON.parse(JSON.stringify(data)) };
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
}

export async function editUserAction(event) {
	try {
		const userId = event.locals.userId;
		if (!userId) {
			return;
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
		return { user: JSON.parse(JSON.stringify(data)) };
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
}
