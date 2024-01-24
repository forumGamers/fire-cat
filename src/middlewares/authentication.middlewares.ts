import { Status } from '@grpc/grpc-js/build/src/constants';
import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { type Observable } from 'rxjs';
import { UserService } from '../modules/user/user.service';
import jwt from '../utils/jwt.utils';
import encryption from '../utils/encryption';

@Injectable()
export class AuthenticationInterceptor implements NestInterceptor {
  constructor(private readonly userService: UserService) {}
  public async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const metadata = context.switchToRpc().getContext();

    const access_token = metadata.get('access_token');
    if (!access_token || !access_token.length)
      throw new RpcException({
        code: Status.UNAUTHENTICATED,
        message: 'missing or invalid token',
      });

    const { UUID, loggedAs } = jwt.verifyToken(access_token[0]);

    const user = await this.userService.findOneById(UUID);
    if (!user.rowLength)
      throw new RpcException({
        code: Status.UNAUTHENTICATED,
        message: 'missing or invalid token',
      });

    const data = user.rows[0];
    metadata.set('user', {
      ...data,
      email: encryption.decrypt(data.email),
      username: encryption.decrypt(data.username),
    });
    metadata.set('loggedAs', loggedAs);

    return next.handle().pipe();
  }
}
