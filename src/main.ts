import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const appOptions = {
    cors: true,
  };
  const app = await NestFactory.create(AppModule, appOptions);
  //global prefix
  app.setGlobalPrefix('api/v1');
  await app.listen(3002);
}
bootstrap();
