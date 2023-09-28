import { Logger, Module } from '@nestjs/common';
import { ChatClientModule } from '../../chat-client/chat-client.module';
import { PrismaService } from '../../utils/prisma/prisma.service';
import { UserProfile } from './mappings/user.profile';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UsersController } from './users.controller';

@Module({
  imports: [ChatClientModule],
  controllers: [UserController, UsersController],
  providers: [UserService, PrismaService, UserProfile, Logger],
  exports: [UserProfile, UserService],
})
export class UserModule {}
