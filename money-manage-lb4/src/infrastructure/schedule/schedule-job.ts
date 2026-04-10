import {inject} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import * as TaskKey from './task/task-binding-key';
import * as Task from './task';

@cronJob()
export class ScheduleJob extends CronJob {
  constructor(
    @inject(TaskKey.CLEAN_UPLOADS_FOLDER_TASK)
    private cleanUploadsFolderTask: Task.CleanUploadsFolderTask,
    @inject(TaskKey.DELETE_TRANSACTION_TASK)
    private deleteTransactionTask: Task.DeleteTransactionTask,
  ) {
    super({
      name: 'system-maintenance',
      onTick: async () => {
        await this.performMaintenance();
      },
      cronTime: '0 2 * * *', // 0 2 * * * (2AM)
      start: true,
    });
  }

  async performMaintenance() {
    await this.cleanUploadsFolderTask.execute();
    await this.deleteTransactionTask.execute();
  }
}
