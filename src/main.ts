import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtMiddleWare } from './jwt/jwt.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  //app.use(JwtMiddleWare); // 미들웨어를 function으로 만들경우 main.ts 에서도 활용가능
  await app.listen(3000);
}
bootstrap();
