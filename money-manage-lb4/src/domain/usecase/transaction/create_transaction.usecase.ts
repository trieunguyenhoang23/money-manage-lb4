import {bind, BindingScope} from '@loopback/core';
import {CREATE_TRANSACTION_USECASE} from '../binding_key.usecase';
import {repository} from '@loopback/repository';
import {TransactionRepository} from '../../../repositories';
import * as core from '@loopback/core';
import * as repo from '@loopback/repository';
import {Transaction} from '../../../models';

@bind({
  scope: BindingScope.SINGLETON,
  tags: {key: CREATE_TRANSACTION_USECASE.key},
})
export class CreateTransactionUseCase {
  constructor(
    @repository(TransactionRepository)
    public transactionRepository: TransactionRepository,
  ) {}

  async execute(body: any, imgDescriptionUrl?: string) {
    const transactionData = new Transaction({
      ...body,
      image_description: imgDescriptionUrl,
    });

    return this.transactionRepository.create(transactionData);
  }
}
