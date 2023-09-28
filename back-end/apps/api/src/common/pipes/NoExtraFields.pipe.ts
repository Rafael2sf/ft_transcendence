import {
  Injectable,
  PipeTransform,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';

@Injectable()
export class NoExtraFieldsPipe extends ValidationPipe implements PipeTransform {
  constructor() {
    const NoExtraFields: ValidationPipeOptions = {
      whitelist: true, // only leave declared and decorated fields, no errors
      forbidNonWhitelisted: true, // ban any undeclared fields
      forbidUnknownValues: true, // ban 'unknown' objects
    };
    super(NoExtraFields);
  }
}
