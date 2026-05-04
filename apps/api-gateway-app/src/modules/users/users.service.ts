import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { USER_SERVICES_PATTERN } from '@app/common/constants/patterns';
import { catchError, Observable, throwError } from 'rxjs';
import { User } from '@app/database/models/user.model';
import { AdminCreateUser, AdminLogin, AdminObject, AdminUpdateUser, ChangePassword, UserFilters, UserLogin, UserObject } from '@app/common/interfaces/users.interfaces';
import { ApiRequest } from '@app/common/interfaces/request.interface';
import { PaginatedResponse, Pagination } from '@app/common/interfaces/pagination.interface';

@Injectable()
export class UsersService {
    constructor(@Inject('USER_SERVICE') private client: ClientProxy) { }

    createUser(data: Partial<User>): any {
        return this.client.send(USER_SERVICES_PATTERN.USER.CREATE_USER, data).pipe(
            catchError((error) => {
                // 'error' is the object we threw in the microservice: { message, status }
                return throwError(
                    () => new HttpException(
                        error.message || 'INTERNAL_SERVER_ERROR',
                        error.status || HttpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }),
        );
    }

    loginUser(data: UserLogin): Observable<UserObject> {
        return this.client.send(USER_SERVICES_PATTERN.USER.LOGIN_USER, data).pipe(
            catchError((error) => {
                // 'error' is the object we threw in the microservice: { message, status }
                return throwError(
                    () => new HttpException(
                        error.message || 'INTERNAL_SERVER_ERROR',
                        error.status || HttpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }),
        );
    }

    loginAdmin(data: AdminLogin): Observable<AdminObject> {
        return this.client.send(USER_SERVICES_PATTERN.USER.LOGIN_ADMIN, data).pipe(
            catchError((error) => {
                // 'error' is the object we threw in the microservice: { message, status }
                return throwError(
                    () => new HttpException(
                        error.message || 'INTERNAL_SERVER_ERROR',
                        error.status || HttpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }),
        );
    }

    getUserInfo(userId: string): any {
        return this.client.send(USER_SERVICES_PATTERN.USER.GET_USER_INFO, userId).pipe(
            catchError((error) => {
                // 'error' is the object we threw in the microservice: { message, status }
                return throwError(
                    () => new HttpException(
                        error.message || 'INTERNAL_SERVER_ERROR',
                        error.status || HttpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }),
        );
    }

    getAllUsers(data: ApiRequest<Pagination<UserFilters>>): Observable<PaginatedResponse<UserObject>> {
        return this.client.send(USER_SERVICES_PATTERN.USER.GET_ALL_USERS, data).pipe(
            catchError((error) => {
                // 'error' is the object we threw in the microservice: { message, status }
                return throwError(
                    () => new HttpException(
                        error.message || 'INTERNAL_SERVER_ERROR',
                        error.status || HttpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }),
        );
    }

    adminCreateUser(data: ApiRequest<AdminCreateUser>): Observable<UserObject> {
        return this.client.send(USER_SERVICES_PATTERN.USER.ADMIN_CREATE_USER, data).pipe(
            catchError((error) => {
                return throwError(
                    () => new HttpException(
                        error.message || 'INTERNAL_SERVER_ERROR',
                        error.status || HttpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }),
        );
    }

    adminUpdateUser(data: ApiRequest<AdminUpdateUser>): Observable<UserObject> {
        return this.client.send(USER_SERVICES_PATTERN.USER.ADMIN_UPDATE_USER, data).pipe(
            catchError((error) => {
                return throwError(
                    () => new HttpException(
                        error.message || 'INTERNAL_SERVER_ERROR',
                        error.status || HttpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }),
        );
    }

    getMe(data: ApiRequest<{ companyId: number; roleId: number }>): Observable<UserObject> {
        return this.client.send(USER_SERVICES_PATTERN.USER.GET_ME, data).pipe(
            catchError((error) => {
                return throwError(
                    () => new HttpException(
                        error.message || 'INTERNAL_SERVER_ERROR',
                        error.status || HttpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }),
        );
    }

    onboardLogin(data: UserLogin): Observable<UserObject> {
        return this.client.send(USER_SERVICES_PATTERN.USER.ONBOARD_LOGIN, data).pipe(
            catchError((error) => {
                return throwError(
                    () => new HttpException(
                        error.message || 'INTERNAL_SERVER_ERROR',
                        error.status || HttpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }),
        );
    }

    changePassword(data: ApiRequest<ChangePassword>): Observable<UserObject> {
        return this.client.send(USER_SERVICES_PATTERN.USER.CHANGE_PASSWORD, data).pipe(
            catchError((error) => {
                // 'error' is the object we threw in the microservice: { message, status }
                return throwError(
                    () => new HttpException(
                        error.message || 'INTERNAL_SERVER_ERROR',
                        error.status || HttpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }),
        );
    }
}

