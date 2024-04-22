import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Request,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationGuard, Public } from './authentication.guard';

@Controller('/auth')
export class AuthenticationController {
  logger = new Logger(AuthenticationController.name);

  constructor(private readonly authService: AuthenticationService) {}

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: { username: string; password: string }) {
    this.logger.debug('signIn', signInDto);
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    this.logger.debug('getting profile', req.subject);
    return req.subject;
  }
}
