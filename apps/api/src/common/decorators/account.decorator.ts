import { SetMetadata } from '@nestjs/common';

export const VERIFIED_ONLY_KEY = 'verifiedOnly';

export const VerifiedOnly = () => SetMetadata(VERIFIED_ONLY_KEY, true);
