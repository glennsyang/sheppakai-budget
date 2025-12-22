import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { user } from './db/schema';
import { getDb } from './db';

export async function register(email: string, password: string) {
	const existing = await getDb().select().from(user).where(eq(user.email, email));
	if (existing.length > 0) throw new Error('User already exists');
	const hash = await bcrypt.hash(password, 10);
	await getDb().insert(user).values({
		email,
		hashed_password: hash
	});
}

export async function authenticate(email: string, password: string) {
	const result = await getDb().select().from(user).where(eq(user.email, email));
	const foundUser = result[0];
	if (!foundUser) return null;
	const valid = await bcrypt.compare(password, foundUser.hashed_password);
	return valid ? foundUser : null;
}
