import { SetMetadata } from '@nestjs/common';

// Metadata key
export const IS_PUBLIC = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC, true);
// SetMetadata takes some keys and values
// this dict will be accessible as the request's metadata
// this metadata can be read with the help of NestJS's Reflector class (='reflection and metadata')
