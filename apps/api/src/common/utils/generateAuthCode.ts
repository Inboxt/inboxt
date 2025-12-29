import { randomBytes } from 'crypto';

export const generateAuthCode = (): string => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const bytes = randomBytes(10);

	const code = Array.from(bytes)
		.map((b) => chars.charAt(b % chars.length))
		.join('');

	return `${code.slice(0, 5)}-${code.slice(5)}`;
};
