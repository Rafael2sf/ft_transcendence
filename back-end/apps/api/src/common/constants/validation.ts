import { ValidationOptions } from 'class-validator';

export const USERNAME_REGEX = /^[a-z][a-z0-9-]{5,11}$/;
export const BAD_USERNAME_OPTIONS: ValidationOptions = {
  message:
    'Username should contain only lowercase letters, numbers, start from a letter, and be 6-12 chars long',
};
