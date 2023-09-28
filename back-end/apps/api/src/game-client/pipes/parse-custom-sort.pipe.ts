import { BadRequestException, PipeTransform } from '@nestjs/common';

export class ParseCustomSortPipe implements PipeTransform<string> {
  constructor(private readonly allowedSortOptions: string[]) {}

  transform(value: string) {
    const sortValue = value.replace(/^-/, '');
    const sortOrder = value.startsWith('-') ? 'desc' : 'asc';

    if (!this.allowedSortOptions.includes(sortValue)) {
      throw new BadRequestException(`sort value not recognized ${value}`);
    }

    return { field: sortValue, order: sortOrder };
  }
}
