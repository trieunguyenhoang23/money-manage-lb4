import {CronComponent} from '@loopback/cron';
import {MoneyMangeApplication} from '../../application';
import {createBindingFromClass} from '@loopback/core';
import {ScheduleJob} from './schedule-job';
import * as TaskKey from './task/task-binding-key';
import * as Task from './task';

export function registerCronJob(app: MoneyMangeApplication) {
  app.component(CronComponent);

  //* Binding the specific job class
  app.add(createBindingFromClass(ScheduleJob));

  //* Task binding
  app
    .bind(TaskKey.CLEAN_UPLOADS_FOLDER_TASK.key)
    .toClass(Task.CleanUploadsFolderTask);
  app
    .bind(TaskKey.DELETE_TRANSACTION_TASK.key)
    .toClass(Task.DeleteTransactionTask);
}
