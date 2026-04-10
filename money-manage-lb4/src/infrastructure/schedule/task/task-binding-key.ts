import {BindingKey} from '@loopback/core';
import * as Task from './index';

export const CLEAN_UPLOADS_FOLDER_TASK =
  BindingKey.create<Task.CleanUploadsFolderTask>('Task.CleanUploadsFolderTask');
export const DELETE_TRANSACTION_TASK =
  BindingKey.create<Task.DeleteTransactionTask>('Task.DeleteTransactionTask');
