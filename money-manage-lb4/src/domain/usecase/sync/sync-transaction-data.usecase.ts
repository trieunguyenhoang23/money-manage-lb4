import {bind, BindingScope, inject} from '@loopback/core';
import {SYNC_TRANSACTION_DATA_USE_CASE} from '../binding_key.usecase';
import {repository} from '@loopback/repository';
import {TransactionRepository} from '../../../repositories';
import {UploadFileS3Service} from '../../../infrastructure/file/upload-file-s3.service';
import {UPLOAD_FILE_S3_SERVICE} from '../../../infrastructure/binding_key.infrastructure';
import {Transaction} from '../../../models';

@bind({
  scope: BindingScope.SINGLETON,
  tags: {key: SYNC_TRANSACTION_DATA_USE_CASE.key},
})
export class SyncTransactionDataUseCase {
  constructor(
    @repository(TransactionRepository)
    public transactionRepository: TransactionRepository,
    @inject(UPLOAD_FILE_S3_SERVICE)
    public s3Service: UploadFileS3Service,
  ) {}

  async execute(
    transactionsData: any[],
    user_id: string,
    multerFiles: any[],
  ): Promise<any> {
    const uploadPromises = transactionsData.map(async data => {
      let imageDescriptionUrl: string | undefined;

      const fileToUpload =
        data.fileIndex !== undefined ? multerFiles[data.fileIndex] : null;

      if (fileToUpload) {
        const uploadedFileS3 = await this.s3Service.uploadFileToS3(
          fileToUpload,
          'money-manage/image_description',
        );
        imageDescriptionUrl = uploadedFileS3.path;
      }

      const {
        fileIndex,
        /// Get remain data in json
        ...pureData
      } = data;

      return new Transaction({
        ...pureData,
        image_description: imageDescriptionUrl,
        user_id,
      });
    });

    const preparedTransactions = await Promise.all(uploadPromises);
    await this.transactionRepository.createAll(preparedTransactions);

    return {message: 'success'};
  }
}
