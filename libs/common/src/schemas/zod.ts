import { z as baseZ } from 'zod';
import { password } from './methods/password';
import { verificationCode } from './methods/verificationCode';

export const z = {
	...baseZ,
	password,
	verificationCode,
};

export * from 'zod';
