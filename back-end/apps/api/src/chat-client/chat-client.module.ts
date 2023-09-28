import { ChatClientGateway } from './chat-client.gateway';
import {
  ClientProviderOptions,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { forwardRef, Module } from '@nestjs/common';
import { ChatClientController } from './chat-client.controller';
import { UserModule } from '../user-client/user/user.module';

const ChatClientOptions: ClientProviderOptions = {
  name: 'CHAT_SERVICE',
  transport: Transport.TCP,
  options: {
    // required for docker
    host: 'chat',
    port: 3000,
  },
};

@Module({
  imports: [
    forwardRef(() => UserModule),
    ClientsModule.register([ChatClientOptions]),
  ],
  controllers: [ChatClientController],
  providers: [ChatClientGateway],
  exports: [ChatClientGateway],
})
export class ChatClientModule {}
