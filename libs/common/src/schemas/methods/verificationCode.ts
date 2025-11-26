import { z } from 'zod';

export const verificationCode = () => {
	return z.string().regex(/^[A-Z0-9]{5}-[A-Z0-9]{5}$/, {
		error: 'Invalid format. Code should look like XXXXX-XXXXX',
	});
};
