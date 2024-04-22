import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  Param,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { SubjectService } from './subjects.service';
import {
  SubjectAPIResponse,
  CreateSubjectAPIBody,
  UpdateSubjectAPIBody,
} from './subjects.types.api';
import { CreateSubject, UpdateSubject } from './subjects.types';

@Controller('/meta/subjects')
@UseInterceptors(ClassSerializerInterceptor)
export class SubjectController {
  private readonly logger = new Logger(SubjectController.name);

  constructor(private readonly subjectService: SubjectService) {}

  @Get('/')
  async listSubjects(): Promise<SubjectAPIResponse[]> {
    const subjects = await this.subjectService.listSubjects();

    return subjects.map((r) => SubjectAPIResponse.fromRecord(r));
  }

  @Get('/:name')
  async getSubject(@Param('name') name: string): Promise<SubjectAPIResponse> {
    const record = await this.subjectService.getSubject(name);
    return SubjectAPIResponse.fromRecord(record);
  }

  @Put('/:name')
  async createSubject(
    @Param('name') subjectName: string,
    @Body() body: CreateSubjectAPIBody | UpdateSubjectAPIBody,
  ): Promise<SubjectAPIResponse> {
    //TODO: be loose with what you accept

    let response: SubjectAPIResponse | undefined = undefined;

    this.logger.log('got body', body);
    if (UpdateSubjectAPIBody.isUpdateSubjectAPIBody(body)) {
      //TODO: is this the right behavior?
      const record = UpdateSubject.fromAPIRequest(
        body,
        body.metadata.name ?? subjectName,
      );
      this.logger.log('got record', { record });

      const updated = await this.subjectService.updateSubject(
        record,
        'test user',
        'test message',
      );

      response = SubjectAPIResponse.fromRecord(updated);
    } else {
      const record = CreateSubject.fromAPIRequest(
        body,
        body.metadata.name ?? subjectName,
      );
      const created = await this.subjectService.createSubject(
        record,
        'test user',
        'test message',
      );
      response = SubjectAPIResponse.fromRecord(created);
    }

    return response;
  }
}
