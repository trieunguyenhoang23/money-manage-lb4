import * as core from '@loopback/core';
import * as UseCaseKey from '../binding_key.usecase';
import * as Infrastructure from '../../../infrastructure/index';
import * as InfrastructureKey from '../../../infrastructure/binding_key.infrastructure';
import {repository} from '@loopback/repository';
import * as Repository from '../../../repositories';
import {Transaction} from '../../../models';

@core.bind({
  scope: core.BindingScope.SINGLETON,
  tags: {key: UseCaseKey.CREATE_TRANSACTION_USE_CASE.key},
})
export class CreateTransactionUseCase {
  constructor(
    @repository(Repository.TransactionRepository)
    public transactionRepository: Repository.TransactionRepository,
    @core.inject(InfrastructureKey.UPLOAD_FILE_S3_SERVICE)
    public s3Service: Infrastructure.UploadFileS3Service,
  ) {}

  async execute(
    body: any,
    user_id: string,
    uploadFileMulter?: Infrastructure.UploadedFileInfo,
  ) {
    let imageDescriptionUrl: string | undefined;
    if (uploadFileMulter) {
      const uploadedFileS3 = await this.s3Service.uploadFileToS3(
        uploadFileMulter,
        //Folder store in S3
        'money-manage/image_description',
      );
      imageDescriptionUrl = uploadedFileS3.path;
    }

    const transactionData = new Transaction({
      ...body,
      image_description: imageDescriptionUrl,
      user_id,
    });

    return this.transactionRepository.create(transactionData);
  }
}
