import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { CommonConfigModule } from '@app/common/config/config.module';
import { ALL_MODELS } from './models/model';
import { ALL_REPOSITORY } from './repositories/repository';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [CommonConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql', // or 'postgres'
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        models: ALL_MODELS,
        autoLoadModels: true,
        sync: { alter: { drop: false } }, // Auto-sync models with database (disable in production!)
        define: {
          freezeTableName: true, // This stops Sequelize from turning 'User' into 'Users'
        },
        logging: false,
      }),
    }),
    SequelizeModule.forFeature(ALL_MODELS),
  ],
  providers: [...ALL_REPOSITORY],
  exports: [SequelizeModule, ...ALL_REPOSITORY],
})
export class DatabaseModule {}
