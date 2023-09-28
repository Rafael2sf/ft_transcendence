import { SetMetadata } from '@nestjs/common';

// Metadata key
export const BYPASS_2FA = 'bypass2fa';

export const Bypass2fa = () => SetMetadata(BYPASS_2FA, true);
// SetMetadata takes some keys and values
// this dict will be accessible as the request's metadata
// this metadata can be read with the help of NestJS's Reflector class (='reflection and metadata')
