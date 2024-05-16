import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SubjectService } from 'src/subjects/subjects.service';

@Injectable()
export class AuthenticationService {
  logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly subjectService: SubjectService,
    private jwtService: JwtService,
  ) {}

  // async validateSubject(
  //   username: string,
  //   password: string,
  // ): Promise<SubjectRecord | null> {
  //   const subject = await this.subjectService.getSubject(username);

  //   const matches = await bcrypt.compare(password, subject.spec.passwordHash!);
  //   if (matches) {
  //     return subject;
  //   }
  //   return null;
  // }

  async signIn(subjectName: any, password: string) {
    const subject = await this.subjectService.getSubject(subjectName);

    //TODO: bcrypt
    if (subject?.spec.passwordHash !== password) {
      this.logger.debug('password check failed');
      return null;
    }

    this.logger.debug('password check succeeded');

    const payload = { sub: subjectName, role: 'user' };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
