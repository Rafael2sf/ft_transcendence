import { DefaultValuePipe, ParseArrayPipe, ParseIntPipe } from '@nestjs/common';
import { QueryRoles } from '../interfaces/QueryRoles';
import { ParseArrayFromEnumPipe } from './ParseStringArrayEnum.pipe';
import { RangeValuePipe } from './RangeValue.pipe';

export const LimitQueryPipes = [
  new DefaultValuePipe(42),
  new ParseIntPipe(),
  new RangeValuePipe<number>(0, 100),
];

export const OffsetQueryPipes = [
  new DefaultValuePipe(0),
  new ParseIntPipe(),
  new RangeValuePipe<number>(0),
];

export const RoleArrayQueryPipes = [
  new DefaultValuePipe(['USER', 'ADMIN']),
  new ParseArrayPipe({ items: String, separator: ',' }),
  new ParseArrayFromEnumPipe(QueryRoles),
];
