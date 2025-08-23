import { db } from './db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { user } from './db/schema';

export async function register(email: string, password: string) {
	const existing = await db.select().from(user).where(eq(user.email, email));
	if (existing.length > 0) throw new Error('User already exists');
	const hash = await bcrypt.hash(password, 10);
	await db.insert(user).values({
		email,
		hashed_password: hash
	});
}

export async function authenticate(email: string, password: string) {
	const result = await db.select().from(user).where(eq(user.email, email));
	const foundUser = result[0];
	if (!foundUser) return null;
	const valid = await bcrypt.compare(password, foundUser.hashed_password);
	return valid ? foundUser : null;
}
