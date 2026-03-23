import {BindingKey} from '@loopback/core';
import {UploadFileMulterService} from './file/upload-file_multer.service';
import {UploadFileS3Service} from './file/upload-file-s3.service';

export const UPLOAD_FILE_MULTER_SERVICE =
  BindingKey.create<UploadFileMulterService>('upload-file-multer.service');

export const UPLOAD_FILE_S3_SERVICE = BindingKey.create<UploadFileS3Service>(
  'upload-file-s3.service',
);
