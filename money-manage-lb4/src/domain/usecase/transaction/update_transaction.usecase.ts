import {bind, BindingScope, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {TransactionRepository} from '../../../repositories';
import {UploadFileS3Service} from '../../../infrastructure/file/upload-file-s3.service';
import {UploadedFileInfo} from '../../../infrastructure/file/upload-file_multer.service';
import {UPLOAD_FILE_S3_SERVICE} from '../../../infrastructure/binding_key.infrastructure';
import {UPDATE_TRANSACTION_USECASE} from '../binding_key.usecase';

@bind({
  scope: BindingScope.SINGLETON,
  tags: {key: UPDATE_TRANSACTION_USECASE.key},
})
export class UpdateTransactionUseCase {
  constructor(
    @repository(TransactionRepository)
    public transactionRepository: TransactionRepository,
    @inject(UPLOAD_FILE_S3_SERVICE)
    public s3Service: UploadFileS3Service,
  ) {}

  async execute(
    id: string,
    userId: string,
    data: any,
    newFile?: UploadedFileInfo,
  ): Promise<any> {
    const existing = await this.transactionRepository.findOne({
      where: {id, user_id: userId},
    });

    if (!existing) throw new Error('Transaction not found');

    const patchData = {...data};
    const isDeleting =
      data.delete_image === 'true' || data.delete_image === true;

    if (newFile) {
      // Replace: Delete old, upload new
      if (existing.image_description) {
        await this.s3Service.deleteFileFromS3(existing.image_description);
      }
      const uploaded = await this.s3Service.uploadFileToS3(
        newFile,
        'money-manage/image_description',
      );
      patchData.image_description = uploaded.path;
    } else if (isDeleting) {
      // Delete: Remove existing from S3 and nullify DB
      if (existing.image_description) {
        await this.s3Service.deleteFileFromS3(existing.image_description);
      }
      patchData.image_description = null;
    }

    // Clean up delete_image flags before saving to DB
    delete patchData.delete_image;

    await this.transactionRepository.updateById(id, patchData);

    return {image_description: patchData.image_description};
  }
}
