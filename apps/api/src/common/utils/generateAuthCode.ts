import { randomBytes } from 'crypto';

export const generateAuthCode = (): string => {
	const code = randomBytes(5).toString('hex').toUpperCase(); // 10 hex chars
	return `${code.slice(0, 5)}-${code.slice(5)}`;
};
