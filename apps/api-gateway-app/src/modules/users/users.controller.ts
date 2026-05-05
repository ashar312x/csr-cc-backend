import { BadRequestException, Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(@Inject('USER_SERVICE') private client: ClientProxy,
        private readonly userService: UsersService) { }

    @Get('/v1/create')
    createUser(@Body() userData: {}): any {
        console.log('Received request to create user with data:', userData);
        const data = this.userService.createUser(userData);
        return {};
    }
}

