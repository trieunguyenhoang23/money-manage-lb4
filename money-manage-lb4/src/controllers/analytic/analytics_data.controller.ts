import * as rest from '@loopback/rest';
import * as core from '@loopback/core';
import * as UseCaseKey from '../../domain/usecase/binding_key.usecase';
import * as UseCase from '../../domain/usecase/index';
import {authenticate} from '@loopback/authentication';
import {TransactionType} from '../../domain/enums/transaction-type.enum';
import {BaseController} from '../base.controller';

export class AnalyticsDataController extends BaseController {
  constructor(
    //* Use Case
    @core.inject(UseCaseKey.GET_FINANCIAL_DATA_USE_CASE)
    private getFinancialDataUseCase: UseCase.GetFinancialDataUseCase,
    @core.inject(UseCaseKey.SPENDING_CATEGORIES_USE_CASE)
    private spendingCategoriesUseCase: UseCase.SpendingCategoriesUseCase,
    @core.inject(UseCaseKey.GET_OVERVIEW_USE_CASE)
    private getOverviewUseCase: UseCase.GetOverviewUseCase,
  ) {
    super();
  }
  //* -------------------------------------------- GET --------------------------------------------

  @rest.get('get/analytics/financial-data')
  @authenticate('jwt')
  async getFinancialData(): Promise<{
    currentBalance: number;
    income: number;
    expense: number;
  }> {
    const user_id = await this.extractUserIdFromToken();
    return await this.getFinancialDataUseCase.execute(user_id);
  }

  @rest.get('get/analytics/spending-categories')
  @authenticate('jwt')
  async getSpendingPerCategory(
    @rest.param.query.string('type') type: TransactionType,
    @rest.param.query.string('startDate') startDate?: string,
    @rest.param.query.string('endDate') endDate?: string,
  ) {
    const user_id = await this.extractUserIdFromToken();

    // Convert the strings to Date objects manually
    const startDateFormat = startDate ? new Date(startDate) : undefined;
    const endDateFormat = endDate ? new Date(endDate) : undefined;

    return this.spendingCategoriesUseCase.execute(
      user_id,
      type,
      startDateFormat,
      endDateFormat,
    );
  }

  @rest.get('get/analytics/overview')
  @authenticate('jwt')
  async getOverviewAnalytic(
    @rest.param.query.string('startDate') startDate: string,
    @rest.param.query.string('endDate') endDate: string,
  ) {
    const user_id = await this.extractUserIdFromToken();

    // Convert the strings to Date objects manually
    const startDateFormat = new Date(startDate);
    const endDateFormat = new Date(endDate);

    return this.getOverviewUseCase.execute(
      user_id,
      startDateFormat,
      endDateFormat,
    );
  }

  //* -------------------------------------------- END GET ---------------------------------------------
}
