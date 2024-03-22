import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import { SubjectRecord } from './subjects.types.record';

@Injectable()
export class SubjectService {
  constructor(private readonly databaseService: DatabaseService) {}
  async onModuleInit(): Promise<void> {
    // await this.databaseService.subjectDB.get('subject/root').catch(() =>
    //   this.databaseService.subjectDB.put({
    //     _id: 'subject/root',
    //     spec: {
    //       passwordHash:
    //         '$2b$13$sOvHbp9N65aC5.Zq21ipMu/qx0QaydoTWJ8JrH3EkF5mRLvtx1FAW',
    //     },
    //     metadata: {
    //       labels: {},
    //     },
    //     history: {
    //       by: 'root',
    //       at: new Date().toISOString(),
    //       message: '',
    //       parent: null,
    //     },
    //     status: {},
    //   }),
    // );
  }

  // async getSubject(id: string): Promise<SubjectRecord> {

  //   // return this.databaseService.subjectDB.get(`subject/${id}`);
  // }
}
