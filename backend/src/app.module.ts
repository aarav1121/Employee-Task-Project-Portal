import { Module } from '@nestjs/common';

import { AppController } from './app.controller';

import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsController } from './products/products.controller';

import { UserModule } from './user/user.module';

import { TaskModule } from './task/task.module';

import { AuthModule } from './auth/auth.module';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // ENVIRONMENT CONFIG

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TaskModule,

    UserModule,

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '2302901540003',
      database: 'nestjs_basic_demo',
      autoLoadEntities: true,
      synchronize: true,
    }),

    AuthModule,
  ],

  controllers: [AppController, ProductsController],

  providers: [AppService],

  exports: [],
})
export class AppModule {}
