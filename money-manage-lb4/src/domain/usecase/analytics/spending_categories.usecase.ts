import {bind, BindingScope, inject} from '@loopback/core';
import {SPENDING_CATEGORIES_USE_CASE} from '../binding_key.usecase';
import {repository} from '@loopback/repository';
import {UserRepository} from '@loopback/authentication-jwt';
import {HttpErrors} from '@loopback/rest';
import {Category, Transaction} from '../../../models';
import {TransactionType} from '../../enums/transaction-type.enum';

@bind({
  scope: BindingScope.SINGLETON,
  tags: {key: SPENDING_CATEGORIES_USE_CASE.key},
})
export class SpendingCategoriesUseCase {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  async execute(
    user_id: string,
    type: TransactionType,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const dateFilter =
      startDate && endDate
        ? {
            transaction_at: {between: [startDate, endDate]},
          }
        : {};

    const user = await this.userRepository.findById(user_id, {
      include: [
        {
          relation: 'categories',
          scope: {where: {type: type}},
        },
        {
          relation: 'transactions',
          scope: {
            where: {
              type: type,
              ...dateFilter,
            },
          },
        },
      ],
    });

    if (!user && user !== undefined)
      HttpErrors.NotFound("This user doesn't exist");

    const categories = user?.categories || [];
    const transactions = user?.transactions || [];

    const categoriesAnalytics = categories.map((category: Category) => {
      const relatedTransactions = transactions.filter(
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
