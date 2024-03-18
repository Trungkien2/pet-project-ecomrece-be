import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';

import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { LogsMiddleware, QueryMiddleware } from './core/middlewares';
import { RouterModule } from '@nestjs/core';
import { ApiRoute, allModule } from './router';
import { PostModule } from './post/post.module';
import { FavoriteModule } from './favorite/favorite.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    // RouterModule.register(ApiRoute),
    ...allModule,
    PostModule,
    FavoriteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(QueryMiddleware, LogsMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
