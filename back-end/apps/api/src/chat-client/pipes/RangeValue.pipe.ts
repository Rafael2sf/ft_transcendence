import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class RangeValuePipe<T> implements PipeTransform {
  constructor(private readonly min: T, private readonly max: T = null) {}
  transform(value: T, metadata: ArgumentMetadata) {
    if (value < this.min || (this.max && value > this.max)) {
      throw new BadRequestException([
        `The value of ${metadata.data} must be ${
          this.max
            ? `in range (${this.min}...${this.max})`
            : `higher or equal to ${this.min}`
        }`,
      ]);
    }
    return value;
  }
}
