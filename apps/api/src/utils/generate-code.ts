import { randomBytes } from 'crypto';

export const generateCode = (): string => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const bytes = randomBytes(10);
	let code = '';

	for (let i = 0; i < bytes.length; i++) {
		const index = bytes[i] % chars.length;
		code += chars[index];
	}

	return `${code.slice(0, 5)}-${code.slice(5)}`;
};
