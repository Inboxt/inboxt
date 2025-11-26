import { z } from './zod.js';
import { rules as createLabelRules } from './createLabel.js';

export const updateLabelSchema = z.object({
	...createLabelRules,
});
