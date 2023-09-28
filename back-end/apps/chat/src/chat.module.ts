import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { RolesGuard } from './guards/roles.guard';
import { PrismaService } from './utils/prisma.service';

@Module({
  imports: [],
  controllers: [ChatController],
  providers: [
    ChatService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class ChatModule {}
