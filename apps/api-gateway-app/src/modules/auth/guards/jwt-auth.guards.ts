import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserObject } from '@app/common/interfaces/users.interfaces';
import { FindOptions } from 'sequelize';

@Injectable()
export class GatewayAuthGuard implements CanActivate {
  //small change
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // 1. Extract the token from the Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('AUTH_GUARD_NO_TOKEN_PROVIDED');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('AUTH_GUARD_INVALID_TOKEN_FORMAT');
    }

    try {
      // 2. Verify the token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      // 4. Attach payload to request object for use in controllers
      request['user'] = payload;
      return true;
    } catch (error) {
      // Token is expired, malformed, or signature is invalid
      throw new UnauthorizedException(
        'AUTH_GUARD_SESSION_EXPIRED_OR_INVALID_TOKEN',
      );
    }
  }
}
