import { SetMetadata } from '@nestjs/common';

export const API_TOKEN_ALLOWED_KEY = 'apiTokenAllowed';
export const ApiTokenAllowed = () => SetMetadata(API_TOKEN_ALLOWED_KEY, true);
