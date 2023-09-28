import {
  Injectable,
  PipeTransform,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';

@Injectable()
export class ValidateParam extends ValidationPipe implements PipeTransform {
  constructor() {
    const paramValidation: ValidationPipeOptions = {
      whitelist: true, // only leave declared and decorated fields, no errors
      forbidNonWhitelisted: true, // ban any undeclared fields
      forbidUnknownValues: true, // ban 'unknown' objects
      transform: true, // allow 'class-transformer'
    };
    super(paramValidation);
  }
}
