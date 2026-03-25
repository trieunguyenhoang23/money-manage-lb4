import {bind, BindingScope} from '@loopback/core';
import {CREATE_TRANSACTION_USECASE} from '../binding_key.usecase';
import {repository} from '@loopback/repository';
import {TransactionRepository} from '../../../repositories';
import * as core from '@loopback/core';
import {Transaction} from '../../../models';
import {UploadedFileInfo} from '../../../infrastructure/file/upload-file_multer.service';
import {UploadFileS3Service} from '../../../infrastructure/file/upload-file-s3.service';
import {UPLOAD_FILE_S3_SERVICE} from '../../../infrastructure/binding_key.infrastructure';

@bind({
  scope: BindingScope.SINGLETON,
  tags: {key: CREATE_TRANSACTION_USECASE.key},
})
export class CreateTransactionUseCase {
  constructor(
    @repository(TransactionRepository)
    public transactionRepository: TransactionRepository,
    @core.inject(UPLOAD_FILE_S3_SERVICE)
    public s3Service: UploadFileS3Service,
  ) {}

  async execute(
    body: any,
    user_id: string,
    uploadFileMulter?: UploadedFileInfo,

  ) {
    let imageDescriptionUrl: string | undefined;
    if (uploadFileMulter) {
      const uploadedFileS3 = await this.s3Service.uploadFileToS3(
        uploadFileMulter,
        //Folder lưu trữ trên S3
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
