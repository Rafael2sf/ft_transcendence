import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class PayloadExistsPipe implements PipeTransform {
  transform(payload: Object): Object {
    if (!Object.keys(payload).length) {
      throw new BadRequestException('Payload should not be empty');
    }
    return payload;
  }
}
