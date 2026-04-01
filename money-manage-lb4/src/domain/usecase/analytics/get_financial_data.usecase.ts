import {bind, BindingScope} from '@loopback/core';
import {GET_FINANCIAL_DATA_USECASE} from '../binding_key.usecase';
import * as repo from '@loopback/repository';
import {UserRepository} from '@loopback/authentication-jwt';
import {HttpErrors} from '@loopback/rest';
import {Transaction} from '../../../models';

@bind({
  scope: BindingScope.SINGLETON,
  tags: {key: GET_FINANCIAL_DATA_USECASE.key},
})
export class GetFinancialDataUseCase {
  constructor(
    @repo.repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  async execute(user_id: string): Promise<{
    currentBalance: number;
    income: number;
    expense: number;
  }> {
    const user = await this.userRepository.findOne({
      where: {id: user_id},
      include: [{relation: 'transactions'}],
    });

    if (!user && user !== undefined)
      HttpErrors.NotFound("This user doesn't exist");

    let income = 0;
    let expense = 0;
    const currentBalance = user?.currentBalance ?? 0;

    if (user?.transactions) {
      user.transactions.forEach((tx: Transaction) => {
        if (tx.type === 'INCOME') {
          income += tx.amount;
        } else if (tx.type === 'EXPENSE') {
          expense += tx.amount;
        }
      });
    }

    return {
      currentBalance,
      income,
      expense,
    };
  }
}
