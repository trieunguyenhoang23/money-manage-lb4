import * as core from '@loopback/core';
import {DELETE_TRANSACTION_TASK} from './task-binding-key';
import {TransactionRepository} from '../../../repositories';
import {repository} from '@loopback/repository';

@core.bind({
  scope: core.BindingScope.SINGLETON,
  tags: {key: DELETE_TRANSACTION_TASK.key},
})
export class DeleteTransactionTask {
  constructor(
    @repository(TransactionRepository)
    private transactionRepository: TransactionRepository,
  ) {}

  async execute() {
    //* Just remove item is marked as is_deleted in 1 hours ago
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    try {
      const result = await this.transactionRepository.deleteAll({
        is_deleted: true,
        updated_at: {lt: oneDayAgo},
      } as any);
    } catch (err) {
      console.error('Failed to purge transactions:', err);
    }
  }
}
