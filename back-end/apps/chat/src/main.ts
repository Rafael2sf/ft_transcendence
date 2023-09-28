import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ChatModule } from './chat.module';
import { AllExceptionFilter } from './filters/AllException.filter';
import { PrismaClientExceptionFilter } from './filters/PrismaClientException.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ChatModule,
    {
      transport: Transport.TCP,
      options: {
        // required for docker
        host: 'chat',
        port: 3000,
      },
    },
  );
  app.useGlobalFilters(
    new AllExceptionFilter(),
    new PrismaClientExceptionFilter(),
  );
  await app.listen();
}
bootstrap();
