import { z } from 'zod';

export const verificationCode = () => {
	return z.string().regex(/^[A-Z0-9]{5}-[A-Z0-9]{5}$/, {
		error: 'Code must be in the format XXXXX-XXXXX',
	});
};
