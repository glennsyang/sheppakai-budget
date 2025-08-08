import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateUUID } from '$lib/utils';

export async function register(email: string, password: string) {
	const existing = await db.select().from(users).where(eq(users.email, email));
	if (existing.length > 0) throw new Error('User already exists');
	const hash = await bcrypt.hash(password, 10);
	await db.insert(users).values({
		id: generateUUID(),
		email,
		hashed_password: hash,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});
}

export async function authenticate(email: string, password: string) {
	const result = await db.select().from(users).where(eq(users.email, email));
	const user = result[0];
	if (!user) return null;
	const valid = await bcrypt.compare(password, user.hashed_password);
	return valid ? user : null;
}
