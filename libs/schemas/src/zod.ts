import { z as baseZ, ZodString } from 'zod';
import { password } from './methods/password';
import { verificationCode } from './methods/verificationCode';

ZodString.prototype.password = function () {
	return password();
};

ZodString.prototype.verificationCode = function () {
	return verificationCode();
};

declare module 'zod' {
	interface ZodString {
		password(): ReturnType<typeof password>;
		verificationCode(): ReturnType<typeof verificationCode>;
	}
}

export const z = baseZ;
export * from 'zod';
