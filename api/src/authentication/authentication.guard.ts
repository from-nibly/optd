import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SubjectService } from 'src/meta/subjects/subjects.service';
import { ActorContext } from 'src/types/types';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
    private subjectService: SubjectService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    let token = this.extractTokenFromHeader(request);
    if (!token) {
      token = this.extractTokenFromCookie(request);
    }
    if (!token) {
      throw new UnauthorizedException({ message: 'No token provided' });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        //TODO: configuration
        secret: this.configService.get<string>('auth.jwtSecret'),
      });

      const subject = await this.subjectService.getSubjectInternal(payload.sub);

      request[ACTOR_CONTEXT] = new ActorContext(subject);
    } catch (e) {
      throw new UnauthorizedException(e);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies['access_token'];
  }
}

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const ACTOR_CONTEXT = Symbol('Actor Context');
