import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationController } from 'src/authentication/authentication.controller';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { SubjectsModule } from 'src/subjects/subjects.module';

@Module({
  imports: [SubjectsModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],

  exports: [AuthenticationService],
})
export class AuthorizationModule {}
