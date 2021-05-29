import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './socket-io.adapter';
import * as cookieParser from 'cookie-parser';
import { CustomLogger } from './logging/custom-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useLogger(app.get(CustomLogger));
  app.useWebSocketAdapter(new SocketIoAdapter(app, ['*']));
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
