import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  Param,
  Put,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { SubjectService } from './subjects.service';
import {
  SubjectAPIResponse,
  CreateSubjectAPIBody,
  UpdateSubjectAPIBody,
} from './subjects.types.api';
import { CreateSubject, UpdateSubject } from './subjects.types';
import { Request } from 'express';

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
    const resp = SubjectAPIResponse.fromRecord(record);
    this.logger.debug('got subject', { record, resp });
    return resp;
  }

  @Put('/:name')
  async createSubject(
    @Param('name') subjectName: string,
    @Body() body: CreateSubjectAPIBody | UpdateSubjectAPIBody,
    @Req() req: any,
  ): Promise<SubjectAPIResponse> {
    const actor = req['subject'];
    let response: SubjectAPIResponse | undefined = undefined;

    if (UpdateSubjectAPIBody.isUpdateSubjectAPIBody(body)) {
      //TODO: is this the right behavior?
      const record = UpdateSubject.fromAPIRequest(
        body,
        body.metadata.name ?? subjectName,
      );
      this.logger.log('got record', { record });

      const updated = await this.subjectService.updateSubject(
        record,
        actor,
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
        actor,
        'test message',
      );
      response = SubjectAPIResponse.fromRecord(created);
    }

    return response;
  }
}
