import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SubjectsModule } from 'src/meta/subjects/subjects.module';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationGuard } from './authentication.guard';
import { AuthenticationService } from './authentication.service';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    SubjectsModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('auth.jwtSecret'),
        //TODO: configuration
        signOptions: { expiresIn: '60m' },
      }),
    }),
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    LocalStrategy,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
  ],
})
export class AuthenticationModule {}
