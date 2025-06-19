import { error, fail } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SECRET_JWT_KEY } from '$env/static/private';
import { getModel } from '$lib/server/db';

export function findUser(userId, filters) {
	const User = getModel(userId, 'User');
	return User.findOne(filters).lean();
}

export function authenticate(cookies) {
	try {
		let token = cookies.get('auth-token');
		if (!token) {
			return;
		}
		const auth = jwt.verify(token, SECRET_JWT_KEY);
		return auth;
	} catch (err) {
		throw error(500, err.body || err.toString());
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
		if (!user) {
			return fail(400, { userIdError: 'Usuario no encontrado' });
		}

		const passwordCorrect = await bcrypt.compare(password, user.password);
		if (!passwordCorrect) {
			return fail(400, { passwordError: 'Contraseña incorrecta' });
		}

		const token = jwt.sign({ id: user._id.toString() }, SECRET_JWT_KEY);
		const options = {
			httpOnly: true,
			secure: true,
			path: '/',
			maxAge: 60 * 60 * 24,
		};
		event.cookies.set('auth-token', token, options);
		event.cookies.set('userId', user.userId, options);

		const message = 'Usuario ingresado';
		return { message };
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
}

export async function createUserAction(event) {
	try {
		if (!event.cookies.get('userId')) {
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

		const hashedPassword = await bcrypt.hash(password, 10);
		const User = getModel(userId, 'User');
		const data = await User.create({ userId, password: hashedPassword });
		const message = 'Usuario creado';
		return { data: JSON.parse(JSON.stringify(data)), message };
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
}

export async function switchThemeAction(event) {
	try {
		const userId = event.cookies.get('userId')
		if (!userId) {
			return;
		}

		const user = await findUser(userId, { userId });
		if (!user) {
			throw error(400, 'Usuario no encontrado');
		}

		const User = getModel(userId, 'User');
		const data = await User.findOneAndUpdate({ userId }, { darkTheme: !user.darkTheme });
		const message = 'Tema cambiado';
		return { data: JSON.parse(JSON.stringify(data)), message };
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
}

export async function getDarkTheme(userId) {
	try {
		const user = await findUser(userId, { userId });
		if (!user) {
			throw error(400, 'Usuario no encontrado');
		}
		return user.darkTheme;
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
}
