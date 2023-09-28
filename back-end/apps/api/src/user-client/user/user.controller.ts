import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  Logger,
  UseInterceptors,
  Query,
  UseFilters,
  FileTypeValidator,
  Put,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  Param,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DirectState, User } from '@prisma/client';
import { CurrentUser, Public } from '../../auth/decorators';
import { ChatClientGateway } from '../../chat-client/chat-client.gateway';
import { UpdateUserDto, UserQuery } from './dto';
import {
  HttpExceptionFilter,
  PrismaExceptionFilter,
} from '../../common/filters';
import { ValidateParam } from '../../common/pipes';
import { LoggingInterceptor } from '../../utils/log/logging.interceptor';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

export class CustomFileTypeValidator extends FileTypeValidator {
  buildErrorMessage(): string {
    return 'Image extension type should be of jpg, jpeg, png or gif';
  }
}

@Controller('user')
@UsePipes(
  ValidationPipe,
)
@UseInterceptors(LoggingInterceptor)
@UseFilters(HttpExceptionFilter, PrismaExceptionFilter)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly chatGateway: ChatClientGateway,
    readonly logger: Logger = new Logger(UserController.name),
    @InjectMapper() private readonly _mapper: Mapper,
  ) {}

  @Get()
  async getUser(@CurrentUser() user: User) {
    const { is_two_factor_enabled } = await this.userService.getUser2fa(user.id);
    return { ...user, is_two_factor_enabled };
  }

  @Get('/search')
  @UsePipes(ValidateParam)
  async searchUser(
    @CurrentUser() user: User,
    @Query() query: UserQuery,
  ): Promise<User> {
    if (query && Object.keys(query).length) {
      return this.findUser(query); // finds first or throws
    }
    throw new BadRequestException('Search parameters are empty');
  }

  async findUserUnique(query: UserQuery): Promise<User> {
    return this.userService.findUniqueOrThrow(query);
  }

  async findUser(query: UserQuery): Promise<User> {
    return this.userService.findOrThrow(query);
  }

  @Patch()
  async updateUser(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const updateUser: UserEntity = this._mapper.map(
      updateUserDto,
      UpdateUserDto,
      UserEntity,
    );

    await this.userService.updateUser({
      where: {
        name: user.name,
      },
      data: updateUser,
    });
    return updateUser;
  }

  @Put('/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUserAvatar(
    @CurrentUser() user: User,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new CustomFileTypeValidator({
            fileType: new RegExp('^.*.(jpg|jpeg|gif|png)$'),
          }),
        )
        .addMaxSizeValidator({
          maxSize: 1048576,
        })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    await this.userService.storeImage(user.id, user.intraname, file.buffer);
  }

  @Get('/:intraname/avatar')
  @Public()
  // @Header('Content-type', 'image/png')
  async getAvatar(@Param('intraname') intraname: string) {
    return new StreamableFile(await this.userService.loadImage(intraname));
  }

  // blocking

  @Get('/blocked/me')
  async getUserBlocked(@CurrentUser() user: User) {
    return this.userService.getUserRelationsByState(user.id, [
      DirectState.BLOCKED,
    ]);
  }

  @Post('/block/:intraname')
  async blockUser(
    @CurrentUser() user: User,
    @Param('intraname') intraname: string,
  ) {
    await this.userService.blockUserOne(user.id, intraname);
  }

  @Delete('/block/:intraname')
  async unblockUser(
    @CurrentUser() user: User,
    @Param('intraname') intraname: string,
  ) {
    await this.userService.unblockUserOne(user.id, intraname);
    return;
  }

  // invites

  @Get('/invites/me')
  async getUserInvites(@CurrentUser() user: User) {
    return await this.userService.getUserRelatedInvites(user.id);
  }

  @Post('/friend/:intraname')
  async createFriendInvite(
    @CurrentUser() user: User,
    @Param('intraname') intraname: string,
  ) {
    await this.userService.createFriendInvite(user.id, intraname);
    return;
  }

  @Delete('/friend/:intraname')
  async deleteFriendOrInvite(
    @CurrentUser() user: User,
    @Param('intraname') intraname: string,
  ) {
    const payload = await this.userService.deleteFriendOrInvite(
      user.id,
      intraname,
    );
    if (payload.previousRelation === DirectState.FRIEND)
      this.chatGateway.server
        .to(`u-${payload.target_id}`)
        .emit('direct.delete', user.intraname);
    return;
  }

  // accept / decline

  @Get('/friends/me')
  async getMeFriends(@CurrentUser() user: User) {
    return await this.userService.getUserRelationsByState(user.id, [
      DirectState.FRIEND,
    ]);
  }

  @Post('/friend/:intraname/accept')
  async aceptFriendInvite(
    @CurrentUser() user: User,
    @Param('intraname') intraname: string,
  ) {
    const data = await this.userService.acceptFriendInvite(user.id, intraname);
    this.chatGateway.server
      .to(`u-${data.user1.id}`)
      .emit('direct.room.join.ack', {
        id: data.user2.relation.id,
        friend: { ...data.user2, relation: undefined },
      });
    this.chatGateway.server
      .to(`u-${data.user2.id}`)
      .emit('direct.room.join.ack', {
        id: data.user1.relation.id,
        friend: { ...data.user1, relation: undefined },
      });
  }

  @Post('/friend/:intraname/decline')
  async declineFriendInvite(
    @CurrentUser() user: User,
    @Param('intraname') intraname: string,
  ) {
    await this.userService.declineFriendInvite(user.id, intraname);
  }

  @Get('/:intraname/friends')
  async getUserFriends(@Param('intraname') intraname: string) {
    return await this.userService.getUserRelationsByState(intraname, [
      DirectState.FRIEND,
    ]);
  }
}
