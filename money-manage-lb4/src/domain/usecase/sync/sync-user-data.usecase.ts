import {repository} from '@loopback/repository';
import {
  CategoryRepository,
  ReminderRepository,
  TransactionRepository,
} from '../../../repositories';
import {Category, Reminder, Transaction} from '../../../models';
import {bind, BindingScope} from '@loopback/core';
import {SYNC_USER_DATA_USECASE} from '../binding_key.usecase';

@bind({
  scope: BindingScope.SINGLETON,
  tags: {key: SYNC_USER_DATA_USECASE.key},
})
export class SyncUserDataUseCase {
  constructor(
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
    @repository(TransactionRepository)
    public transactionRepository: TransactionRepository,
    @repository(ReminderRepository)
    public reminderRepository: ReminderRepository,
  ) {}

  async execute(
    body: {
      categories: Category[];
      transactions: Transaction[];
      reminders: Reminder[];
    },
    userId: string,
  ) {
    const {categories, transactions, reminders} = body;

    try {
      await Promise.all([
        this.syncEntities(this.categoryRepository, categories, userId),
        this.syncEntities(this.reminderRepository, reminders, userId),
        this.syncEntities(this.transactionRepository, transactions, userId),
      ]);

      return {status: 'success'};
    } catch (err) {
      console.error('Sync Error:', err);
      throw err;
    }
  }

  private async syncEntities(
    repo: any,
    entities: any[],
    userId: string,
  ): Promise<void> {
    if (!entities || entities.length === 0) return;

    const operations = entities.map(async item => {
      item.user_id = userId;

      // Ensure using the ID provided by the mobile app
      const id = item.id;

      const exists = await repo.exists(id);
      if (exists) {
        // Use updateById to preserve other fields MongoDB might have added
        return repo.updateById(id, item);
      } else {
        return repo.create(item);
      }
    });

    await Promise.all(operations);
  }
}
