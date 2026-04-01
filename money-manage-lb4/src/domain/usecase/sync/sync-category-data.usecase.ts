import {bind, BindingScope} from '@loopback/core';
import {SYNC_CATEGORY_DATA_USECASE} from '../binding_key.usecase';
import {repository} from '@loopback/repository';
import {CategoryRepository} from '../../../repositories';

@bind({
  scope: BindingScope.SINGLETON,
  tags: {key: SYNC_CATEGORY_DATA_USECASE.key},
})
export class SyncCategoryDataUseCase {
  constructor(
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
  ) {}

  async execute(entities: any[], userId: string) {
    if (!entities || entities.length === 0) return;

    const operations = entities.map(async item => {
      item.user_id = userId;

      // Ensure using the ID provided by the mobile app
      const id = item.id;

      const exists = await this.categoryRepository.exists(id);
      if (exists) {
        // Use updateById to preserve other fields MongoDB might have added
        return this.categoryRepository.updateById(id, item);
      } else {
        return this.categoryRepository.create(item);
      }
    });

    await Promise.all(operations);
  }
}
