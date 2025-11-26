import { z } from './zod.js';
import { rules as createAccountRules } from './createAccount.js';

export const updateAccountSchema = z.object({
	emailAddress: createAccountRules.emailAddress.optional(),
	username: createAccountRules.username.optional(),
});
