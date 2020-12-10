import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleWare } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurants.entity';
import { Category } from './restaurants/entities/category.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'prod', 'test')
          .required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod',
      logging:
        process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
      entities: [User, Verification, Restaurant, Category], //요런식으로 테이블 엔티티를 지정해줄수도있음.
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      // apollo-server 의 context의 기능
      // context는 함수로 정의되고
      // request 마다 매번 호출되며 req property를 가진 object를 받는다.
      // 고로 모든 리졸버에서 접근이 가능하다.
      context: ({ req }) => ({ user: req['user'] }),
      // 이렇게 context를 작성하게되면 request에 user라는 프로퍼티가 존재하게 된다.
    }),
    RestaurantsModule,
    UsersModule,
    CommonModule,

    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    AuthModule,
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleWare).forRoutes({
      path: '/graphql',
      method: RequestMethod.POST,
    });

    // JwtMiddleWare를 forRoutes()를 통해 '/graphql' 경로(path)에
    // POST 메서드의 경우에만 적용(apply)한다는 것
    // consumer.apply(JwtMiddleWare).forRoutes({
    //   //path: '/graphql',
    //   path: '*',
    //   // method: RequestMethod.POST,
    //   method: RequestMethod.ALL,
    // });

    // // JwtMiddleWare를 /api 경로에서 모든 request method 를 제외시키는 방법
    // consumer.apply(JwtMiddleWare).exclude({
    //   path: '/api',
    //   method: RequestMethod.ALL,
    // });
  }
}
