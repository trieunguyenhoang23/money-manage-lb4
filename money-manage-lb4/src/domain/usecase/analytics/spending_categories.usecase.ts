import {bind, BindingScope, inject} from '@loopback/core';
import {SPENDING_CATEGORIES_USECASE} from '../binding_key.usecase';
import {repository} from '@loopback/repository';
import {UserRepository} from '@loopback/authentication-jwt';
import {HttpErrors} from '@loopback/rest';
import {Category, Transaction} from '../../../models';
import {TransactionType} from '../../enums/transaction-type.enum';

@bind({
  scope: BindingScope.SINGLETON,
  tags: {key: SPENDING_CATEGORIES_USECASE.key},
})
export class SpendingCategoriesUseCase {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  async execute(user_id: string, type: TransactionType): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {id: user_id},
      include: [{relation: 'transactions'}, {relation: 'categories'}],
    });

    if (!user && user !== undefined)
      HttpErrors.NotFound("This user doesn't exist");

    const filteredCategories = (user?.categories || []).filter(
      (cat: Category) => cat.type === type,
    );

    const filteredTransactions = (user?.transactions || []).filter(
      (tx: Transaction) => tx.type === type,
    );

    const categoriesAnalytics = filteredCategories.map((category: Category) => {
      const relatedTransactions = filteredTransactions.filter(
        (tx: Transaction) => tx.category_id == category.id,
      );

      const totalAmount = relatedTransactions.reduce(
        (sum: number, t: Transaction) => sum + (t.amount || 0),
        0,
      );

      return {
        id: category.id,
        name: category.name,
        type: category.type,
        totalAmount: totalAmount,
        transactionCount: relatedTransactions.length,
      };
    });

    return categoriesAnalytics;
  }
}
