import { NestFactory } from '@nestjs/core';
import { GameModule } from './game.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PrismaClientExceptionFilter } from './filters/prisma-client-exception.filter';
import { AllExceptionFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    GameModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'game',
        port: 3002,
      },
    },
  );
  app.useGlobalFilters(
    new PrismaClientExceptionFilter(),
    new AllExceptionFilter(),
  );
  await app.listen();
}
bootstrap();
