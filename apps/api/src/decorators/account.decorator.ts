import { SetMetadata } from '@nestjs/common';

export const NON_DEMO_KEY = 'nonDemo';
export const VERIFIED_ONLY_KEY = 'verifiedOnly';

export const NonDemo = () => SetMetadata(NON_DEMO_KEY, true);
export const VerifiedOnly = () => SetMetadata(VERIFIED_ONLY_KEY, true);
