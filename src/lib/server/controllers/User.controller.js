import { error, fail } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_KEY } from '$env/static/private';
import { getModel, toPlain } from '$lib/server/db';
import { handleServerError } from '$lib/server/errors.js';
import { str } from '$lib/server/validate.js';
import { resetDemo } from '$lib/server/controllers/Demo.controller.js';

const buckets = new Map();

function tooManyAttempts(key) {
	const now = Date.now();
	if (buckets.size > 10000) {
		for (const [staleKey, stale] of buckets) {
			if (now > stale.reset) {
				buckets.delete(staleKey);
			}
		}
	}

	const bucket = buckets.get(key);
	if (!bucket || now > bucket.reset) {
		buckets.set(key, { count: 1, reset: now + 15 * 60 * 1000 });
		return false;
	}

	bucket.count += 1;
	return bucket.count > 10;
}

function clearAttempts(key) {
	buckets.delete(key);
}

export function findUser(userId, filters, projection = { __v: 0, _id: 0, password: 0 }) {
	const User = getModel(userId, 'User');
	return User.findOne(filters, projection).lean();
}

function findUserForAuth(userId, filters) {
	const User = getModel(userId, 'User');
	return User.findOne(filters, { __v: 0 }).lean();
}

export async function authenticate(cookies) {
	const token = cookies.get('auth-token');
	if (!token) {
		return;
	}

	let auth;
	try {
		auth = jwt.verify(token, JWT_KEY, { algorithms: ['HS256'] });
	} catch {
		return;
	}
	if (!auth?.userId) {
		return;
	}

	const user = await findUser(auth.userId, { userId: auth.userId }, { userId: 1, _id: 0 });
	return user ? auth : undefined;
}

function signIn(event, user) {
	const days = user.userId === 'demo' ? 1 : 30;
	const token = jwt.sign({ id: user._id.toString(), userId: user.userId }, JWT_KEY, { expiresIn: `${days}d` });
	event.cookies.set('auth-token', token, {
		httpOnly: true,
		secure: true,
		path: '/',
		maxAge: 60 * 60 * 24 * days,
	});
}

export async function loginUserAction(event) {
	try {
		const form = await event.request.formData();
		const userId = str(form.get('userId')).toLowerCase();
		const password = form.get('password');
		if (!userId) {
			return fail(400, { userIdError: 'Ingrese el usuario' });
		}
		if (!password) {
			return fail(400, { passwordError: 'Ingrese la contraseña' });
		}

		const key = `login:${event.getClientAddress()}`;
		if (tooManyAttempts(key)) {
			return fail(429, { passwordError: 'Demasiados intentos, espere unos minutos' });
		}

		const user = await findUserForAuth(userId, { userId });
		const passwordCorrect = await bcrypt.compare(password, user?.password || '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
		if (!user || !passwordCorrect) {
			return fail(400, { passwordError: 'Usuario o contraseña incorrecta' });
		}

		clearAttempts(key);
		signIn(event, user);
		await resetDemo(userId);

		const message = 'Usuario ingresado';
		return { message };
	} catch (err) {
		handleServerError(err, 'loginUserAction');
	}
}

export async function demoLoginAction(event) {
	try {
		if (tooManyAttempts(`demo:${event.getClientAddress()}`)) {
			throw error(429, 'Demasiados intentos, espere unos minutos');
		}

		const user = await findUserForAuth('demo', { userId: 'demo' });
		if (!user) {
			throw error(404, 'La cuenta de demostración no está disponible');
		}

		signIn(event, user);
		await resetDemo('demo');

		const message = 'Usuario ingresado';
		return { message };
	} catch (err) {
		handleServerError(err, 'demoLoginAction');
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
			name: str(form.get('name')),
			description: str(form.get('description')),
			phone: str(form.get('phone')),
			address: str(form.get('address')),
			email: str(form.get('email')).toLowerCase(),
		};

		if (!user.name) {
			return fail(400, { nameError: 'Ingrese el nombre' });
		}

		const User = getModel(userId, 'User');
		const data = await User.findOneAndUpdate({ userId }, user, { returnDocument: 'after', projection: { __v: 0, _id: 0, password: 0 } });
		return { user: toPlain(data) };
	} catch (err) {
		handleServerError(err, 'editUserAction');
	}
}
