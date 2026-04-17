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

  async execute(
    user_id: string,
    startDate: Date,
    endDate: Date,
    groupBy: string,
  ) {
    const collection = (
      this.transactionRepository.dataSource.connector as any
    ).collection('Transaction');

    //* Create pipeline
    const [result] = await collection
      .aggregate([
        {$match: {user_id: new ObjectId(user_id), is_deleted: {$ne: true}}},
        {
          $facet: {
            initialTotals: [
              {$match: {transaction_at: {$lt: startDate}}}, // Less than start date
              {
                $group: {
                  _id: null,
                  totalIncome: {
                    $sum: {$cond: [{$eq: ['$type', 'INCOME']}, '$amount', 0]},
                  },
                  totalExpense: {
                    $sum: {$cond: [{$eq: ['$type', 'EXPENSE']}, '$amount', 0]},
                  },
                },
              },
            ],
            chartData: [
              {$match: {transaction_at: {$gte: startDate, $lte: endDate}}},
              {
                $group: {
                  _id: {$dateTrunc: {date: '$transaction_at', unit: groupBy}},
                  income: {
                    $sum: {$cond: [{$eq: ['$type', 'INCOME']}, '$amount', 0]},
                  },
                  expense: {
                    $sum: {$cond: [{$eq: ['$type', 'EXPENSE']}, '$amount', 0]},
                  },
                },
              },
              {$sort: {_id: 1}}, // ASC
              {
                $project: {
                  label: {$dateToString: {format: '%Y-%m-%d', date: '$_id'}},
                  income: 1,
                  expense: 1,
                },
              },
            ],
          },
        },
      ])
      .toArray();

    let runningIncome = result.initialTotals?.[0]?.totalIncome ?? 0;
    let runningExpense = result.initialTotals?.[0]?.totalExpense ?? 0;

    const finalData = result.chartData.map((item: any) => {
      // Cumulative (In = Σ Income, En = Σ Expense)
      runningIncome += item.income;
      runningExpense += item.expense;

      return {
        label: item.label,
        income: runningIncome,
        expense: runningExpense,
      };
    });

    return {
      groupType: groupBy,
      data: finalData,
    };
  }
}
