import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Controller,
  Get,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  Logger,
  UseInterceptors,
  Query,
  UseFilters,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { UsersQuery } from './dto';
import { PrismaExceptionFilter } from '../../common/filters';
import { ValidateParam } from '../../common/pipes';
import { LoggingInterceptor } from '../../utils/log/logging.interceptor';
import { UserService } from './user.service';
import { UserFilterCtx } from './enums';

@Controller('users')
// @Public() // <- test
@UsePipes(ValidationPipe)
@UseInterceptors(LoggingInterceptor)
@UseFilters(PrismaExceptionFilter)
export class UsersController {
  constructor(
    private readonly userService: UserService,
    readonly logger: Logger = new Logger(UsersController.name),
    @InjectMapper() private readonly _mapper: Mapper,
  ) {}

  @Get('/search')
  @UsePipes(ValidateParam)
  async searchUsers(@Query() query: UsersQuery): Promise<User[]> | never {
    if (query && Object.keys(query).length) {
      return this.findUsers(query);
    }
    throw new BadRequestException('Search parameters are empty');
  }

  async findUsers(query: UsersQuery): Promise<User[]> | never {
    const { like, limit, ctx }: UsersQuery = query;

    // Prisma queries
    const nameOrIntranameLike: Prisma.UserWhereInput = {
      OR: [
        { intraname: { startsWith: like?.trim(), mode: 'insensitive' } },
        { name: { startsWith: like?.trim(), mode: 'insensitive' } },
      ],
    };
    // Order keys
    const orderByLadderDesc: Prisma.UserOrderByWithRelationInput = {
      ladder: 'desc',
    };
    const orderByNameAsc: Prisma.UserOrderByWithRelationInput = { name: 'asc' };

    let users: User[];
    switch (ctx) {
      case UserFilterCtx.SEARCHBAR:
        if (!like)
          throw new BadRequestException('searchbar: like should be defined');
        users = await this.userService.users({
          // take:     limit,
          where: nameOrIntranameLike,
          orderBy: orderByNameAsc,
        });
        break;
      case UserFilterCtx.LEADERBOARD:
        users = await this.userService.users({
          take: limit,
          orderBy: orderByLadderDesc,
          where: { ladder: { not: 0 }, intraname: { not: 'marvin' } },
          // if like is defined, it is ignored
        });

        break;
    }
    return users;
  }
}
