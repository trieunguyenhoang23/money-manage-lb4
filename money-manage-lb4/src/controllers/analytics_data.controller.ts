import * as rest from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {authenticate} from '@loopback/authentication';
import {Getter, inject} from '@loopback/core';
import {GetFinancialDataUseCase} from '../domain/usecase/analytics/get_financial_data.usecase';
import * as usecase from '../domain/usecase/binding_key.usecase';
import {SpendingCategoriesUseCase} from '../domain/usecase/analytics/spending_categories.usecase';
import {TransactionType} from '../domain/enums/transaction-type.enum';
import {GetOverviewUseCase} from '../domain/usecase/analytics/get_overview.usecase';

export class AnalyticsDataController {
  constructor(
    @inject(usecase.GET_FINANCIAL_DATA_USECASE)
    private getFinancialDataUseCase: GetFinancialDataUseCase,
    @inject(usecase.SPENDING_CATEGORIES_USECASE)
    private spendingCategoriesUseCase: SpendingCategoriesUseCase,
    @inject(usecase.GET_OVERVIEW_USECASE)
    private getOverviewUseCase: GetOverviewUseCase,
  ) {}

  @rest.get('get/analytics/financial-data')
  @authenticate('jwt')
  async getFinancialData(
    @inject.getter(SecurityBindings.USER) getUser: Getter<UserProfile>,
  ): Promise<{currentBalance: number; income: number; expense: number}> {
    const currentUserProfile = await getUser();
    const user_id = currentUserProfile[securityId];

    return await this.getFinancialDataUseCase.execute(user_id);
  }

  @rest.get('get/analytics/spending-categories')
  @authenticate('jwt')
  async getSpendingPerCategory(
    @inject.getter(SecurityBindings.USER) getUser: Getter<UserProfile>,
    @rest.param.query.string('type') type: TransactionType,
    @rest.param.query.string('startDate') startDate?: string,
    @rest.param.query.string('endDate') endDate?: string,
  ) {
    const currentUserProfile = await getUser();
    const user_id = currentUserProfile[securityId];

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
    @inject.getter(SecurityBindings.USER) getUser: Getter<UserProfile>,
    @rest.param.query.string('startDate') startDate: string,
    @rest.param.query.string('endDate') endDate: string,
  ) {
    const currentUserProfile = await getUser();
    const user_id = currentUserProfile[securityId];

    // Convert the strings to Date objects manually
    const startDateFormat = new Date(startDate);
    const endDateFormat = new Date(endDate);

    return this.getOverviewUseCase.execute(
      user_id,
      startDateFormat,
      endDateFormat,
    );
  }
}
