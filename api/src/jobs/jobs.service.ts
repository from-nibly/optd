import { Injectable, Logger } from '@nestjs/common';
import * as PgBoss from 'pg-boss';
import { DatabaseService } from 'src/database/databases.service';
import { Cron } from 'src/meta/crons/crons.types';

@Injectable()
export class JobsService {
  private boss: PgBoss;
  private readonly logger = new Logger(JobsService.name);

  async onModuleInit() {
    this.boss = new PgBoss('postgresql://optd:foobar@localhost:5432/optd');

    await this.boss.start();

    await this.boss.work('/cron/*', {}, async (job) => {
      this.logger.debug('got a cron job', job);
    });
  }

  constructor(private readonly dbService: DatabaseService) {}

  async scheduleCron(cron: Cron) {
    const jobName = `/cron/${cron.metadata.name}`;
    await this.boss.schedule(jobName, cron.spec.schedule, cron, {
      tz: cron.spec.tz,
      singletonKey: jobName,
      retryBackoff: true,
      expireInHours: 24,
    });
  }
  async unscheduleCron(cron: Cron) {
    const jobName = `/cron/${cron.metadata.name}`;
    const result = await this.boss.unschedule(jobName);
    const job = await this.boss.fetch(jobName);
    if (job) {
      await this.boss.cancel(job.id);
    }
    this.logger.debug('unschedule result', { result, job });
  }
}
