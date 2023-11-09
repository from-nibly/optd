import { Module } from '@nestjs/common';
import { SubjectsModule } from 'src/subjects/subjects.module';
import { AuthenticationService } from './authentication.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthenticationController } from './authentication.controller';

@Module({
  imports: [SubjectsModule, PassportModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, LocalStrategy],
})
export class AuthenticationModule {}
