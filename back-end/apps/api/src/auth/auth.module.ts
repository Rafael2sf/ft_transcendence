import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from '../utils/prisma/prisma.service';
import { UserModule } from '../user-client/user/user.module';
import { Auth42Strategy, JwtStrategy } from './strategies';
import { ChatClientModule } from '../chat-client/chat-client.module';

@Module({
  imports: [
    ChatClientModule,
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    Auth42Strategy,
    PrismaService,
    JwtService,
    Logger,
  ],
})
export class AuthModule {}
