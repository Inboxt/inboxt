import { z } from './zod';
import { rules as createLabelRules } from './createLabel';

export const updateLabelSchema = z.object({
	...createLabelRules,
});
