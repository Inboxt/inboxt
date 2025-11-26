import { z as baseZ } from 'zod';
import { password } from './methods/password.js';
import { verificationCode } from './methods/verificationCode.js';

export const z = {
	...baseZ,
	password,
	verificationCode,
};

export * from 'zod';
