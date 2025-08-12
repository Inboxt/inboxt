import { z } from './zod';
import { rules as createAccountRules } from './createAccount';

export const updateAccountSchema = z.object({
	emailAddress: createAccountRules.emailAddress.optional(),
	username: createAccountRules.username.optional(),
});
