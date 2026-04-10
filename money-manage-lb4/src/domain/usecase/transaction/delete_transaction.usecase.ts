import * as core from '@loopback/core';
import * as rest from '@loopback/rest';
import * as UseCaseKey from '../binding_key.usecase';
import {repository} from '@loopback/repository';
import * as Repository from '../../../repositories';
import * as Infrastructure from '../../../infrastructure/index';
import * as InfrastructureKey from '../../../infrastructure/binding_key.infrastructure';

@core.bind({
  scope: core.BindingScope.SINGLETON,
  tags: {key: UseCaseKey.DELETE_TRANSACTION_USE_CASE.key},
})
export class DeleteTransactionUseCase {
  constructor(
    @repository(Repository.TransactionRepository)
    public transactionRepository: Repository.TransactionRepository,
    @core.inject(InfrastructureKey.UPLOAD_FILE_S3_SERVICE)
    public s3Service: Infrastructure.UploadFileS3Service,
  ) {}

  async execute(id: string, user_id: string) {
    const transaction = await this.transactionRepository.findOne({
      where: {id, user_id},
    });

    if (!transaction) {
      throw new rest.HttpErrors.NotFound(
        `Transaction with id ${id} not found or you don't have permission to delete it.`,
      );
    }

    if (transaction.image_description) {
      await this.s3Service.deleteFileFromS3(transaction.image_description);
    }

    await this.transactionRepository.updateById(id, {
      is_deleted: true,
      updated_at: new Date().toISOString(),
      image_description: '',
    });
  }
}
