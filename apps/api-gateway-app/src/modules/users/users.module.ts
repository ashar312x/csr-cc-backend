import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersController } from './users.controller';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
// import { UsersRepository } from '@app/database/repositories/user.repository';
import { DatabaseModule } from '@app/database/database.module';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'USER_SERVICE',
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: { host: configService.get<string>('USER_SERVICE_HOST'), port: configService.get<number>('USER_SERVICE_PORT') },
                })
            },
        ]),
        DatabaseModule
    ],
    providers: [UsersService, ConfigService, JwtService],
    controllers: [UsersController],
})
export class UsersModule { }