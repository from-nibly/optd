import { Injectable, Logger } from '@nestjs/common';
import PgBoss = require('pg-boss');
import { DatabaseService } from 'src/database/databases.service';
import { ExecutorService } from 'src/executor/executor.service';
import { Cron } from 'src/meta/crons/crons.types';

@Injectable()
export class JobsService {
  private boss: PgBoss;
  private readonly logger = new Logger(JobsService.name);

  async onModuleInit() {
    this.boss = new PgBoss('postgresql://optd:foobar@localhost:5432/optd');

    this.logger.debug('starting boss');
    await this.boss.start();

    await this.boss.work('/cron/*', {}, async (job) => {
      this.logger.debug('got a cron job', job);

      const cron = job.data as Cron;

      const result = await this.executorService.executeScript(
        cron.spec.script,
        cron.history.id,
        'cron',
        Cron.kind,
        cron,
      );

      this.logger.debug('cron result', result);
    });

    this.logger.debug('started boss');
  }

  constructor(
    private readonly dbService: DatabaseService,
    private readonly executorService: ExecutorService,
  ) {}

  //TODO: somehow this needs to become resilient to restarts
  async scheduleCron(cron: Cron) {
    const jobName = `/cron/${cron.metadata.name}`;
    await this.boss.schedule(jobName, cron.spec.schedule, cron, {
      tz: cron.spec.tz,
      singletonKey: jobName,
      retryBackoff: true,
      expireInHours: 24,
    });
    this.logger.debug('scheduled cron', { cron });
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
