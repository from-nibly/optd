import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthenticationService } from './authentication.service';
import { isPouchDBError } from 'src/utils.types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private readonly authService: AuthenticationService) {
    super();
  }

  async validate(username: string, password: string) {
    try {
      const subject = await this.authService.validateSubject(
        username,
        password,
      );
      if (!subject) {
        throw new UnauthorizedException();
      }
      return subject;
    } catch (e) {
      if (isPouchDBError(e)) {
        this.logger.error(e);
        throw new UnauthorizedException();
      }
      throw e;
    }
  }
}
