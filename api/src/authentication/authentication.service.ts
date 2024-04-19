import { Injectable } from '@nestjs/common';
import { SubjectService } from 'src/subjects/subjects.service';
import * as bcrypt from 'bcrypt';
import { SubjectDBRecord } from 'src/subjects/subjects.types.record';

@Injectable()
export class AuthenticationService {
  constructor(private readonly subjectService: SubjectService) {}

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

  // async login(user: any) {
  //   const payload = { username: user.username, sub: user.userId };

  //   // return {
  //   //   access_token: this.jwtService.sign(payload),
  //   // };
  // }
}
