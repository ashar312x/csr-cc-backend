import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
@Injectable()
export class UsersService {
    constructor(@Inject('USER_SERVICE') private client: ClientProxy) { }

    createUser(data: any): any {
        console.log('Creating user with data:', data);
        return {data:"Ashar"};
    }
}

