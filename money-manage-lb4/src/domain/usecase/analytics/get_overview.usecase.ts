import {bind, BindingScope} from '@loopback/core';
import {GET_OVERVIEW_USE_CASE} from '../binding_key.usecase';
import {repository} from '@loopback/repository';
import {TransactionRepository} from '../../../repositories';
const {ObjectId} = require('mongodb');

@bind({
  scope: BindingScope.SINGLETON,
  tags: {key: GET_OVERVIEW_USE_CASE.key},
})
export class GetOverviewUseCase {
  constructor(
    @repository(TransactionRepository)
    private transactionRepository: TransactionRepository,
  ) {}

  async execute(user_id: string, startDate: Date, endDate: Date) {
    const diffInDays =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    let groupBy: 'day' | 'month' | 'year';
    let format = '%Y-%m-%d';

    if (diffInDays <= 31) {
      groupBy = 'day';
    } else if (diffInDays <= 900) {
      groupBy = 'month';
      format = '%Y-%m';
    } else {
      groupBy = 'year';
      format = '%Y';
    }

    const collection = (
      this.transactionRepository.dataSource.connector as any
    ).collection('Transaction');

    const [result] = await collection
      .aggregate([
        {$match: {user_id: new ObjectId(user_id)}},
        {
          $facet: {
            // Calculate starting totals for everything BEFORE startDate
            initialTotals: [
              {$match: {transaction_at: {$lt: startDate}}},
              {
                $group: {
                  _id: null,
                  totalIncome: {
                    $sum: {$cond: [{$eq: ['$type', 'INCOME']}, '$amount', 0]},
                  },
                  totalExpense: {
                    $sum: {$cond: [{$eq: ['$type', 'EXPENSE']}, '$amount', 0]},
                  },
                  totalBalance: {
                    $sum: {
                      $cond: [
                        {$eq: ['$type', 'INCOME']},
                        '$amount',
                        {$subtract: [0, '$amount']},
                      ],
                    },
                  },
                },
              },
            ],
            chartData: [
              {$match: {transaction_at: {$gte: startDate, $lte: endDate}}},
              {
                $group: {
                  _id: {
                    $dateToString: {format: format, date: '$transaction_at'},
                  },
                  income: {
                    $sum: {$cond: [{$eq: ['$type', 'INCOME']}, '$amount', 0]},
                  },
                  expense: {
                    $sum: {$cond: [{$eq: ['$type', 'EXPENSE']}, '$amount', 0]},
                  },
                },
              },
              {$sort: {_id: 1}},
            ],
          },
        },
      ])
      .toArray();

    // Initialize running totals from the Past
    let runningIncome = result.initialTotals?.[0]?.totalIncome ?? 0;
    let runningExpense = result.initialTotals?.[0]?.totalExpense ?? 0;
    let runningBalance = result.initialTotals?.[0]?.totalBalance ?? 0;

    // Transform data using Cumulative Logic
    const data: any[] = [];

    result.chartData.forEach((item: any, index: number) => {
      runningIncome += item.income;
      runningExpense += item.expense;
      runningBalance += item.income - item.expense;

      let trend: 'up' | 'down' | 'flatten' | 'none';

      if (index === 0) {
        trend = 'none';
      } else {
        const previousBalance = data[index - 1].balance;

        if (runningBalance > previousBalance) {
          trend = 'up';
        } else if (runningBalance < previousBalance) {
          trend = 'down';
        } else {
          trend = 'flatten';
        }
      }

      data.push({
        label: item._id,
        income: runningIncome,
        expense: runningExpense,
        balance: runningBalance,
        trend,
      });
    });

    return {
      groupType: groupBy,
      data,
    };
  }
}
