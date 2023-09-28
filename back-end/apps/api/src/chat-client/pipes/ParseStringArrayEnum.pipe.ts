import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

/**
 * Receives an array and validates its elements using an enum as reference
 * By default an error will be returned if:
 *  Element is not in the enum
 *  Duplicate value
 */
@Injectable()
export class ParseArrayFromEnumPipe<T, U> implements PipeTransform {
  constructor(private readonly args: T) {}
  transform(value: U[], metadata: ArgumentMetadata): U[] {
    const data: U[] = [];

    value.forEach((elem) => {
      if (Object.values(this.args).includes(elem)) {
        if (data.includes(elem))
          throw new BadRequestException(
            `Provided duplicate 'field' ${elem} in '${metadata.data}' array`,
          );
        data.push(elem);
      } else {
        throw new BadRequestException(
          `Provided invalid field '${elem}' in '${metadata.data}' array`,
        );
      }
    });

    return data;
  }
}
