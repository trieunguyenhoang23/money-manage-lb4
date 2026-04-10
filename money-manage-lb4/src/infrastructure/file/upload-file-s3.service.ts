import {BindingScope, injectable} from '@loopback/core';
import {
  S3,
  ObjectCannedACL,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import {readFile} from 'fs/promises';
import {UPLOAD_FILE_S3_SERVICE} from '../binding_key.infrastructure';

@injectable({
  scope: BindingScope.SINGLETON,
  tags: {key: UPLOAD_FILE_S3_SERVICE.key},
})
export class UploadFileS3Service {
  private s3Client: S3;
  constructor() {
    this.s3Client = new S3({
      endpoint: process.env.S3ENDPOINTURL,
      region: process.env.S3REGION,
      credentials: {
        accessKeyId: '' + (process.env.S3ACCESSKEY ?? ''),
        secretAccessKey: '' + (process.env.S3SECRETKEY ?? ''),
      },
    });
  }

  async uploadFileToS3(file: any, keyPrefix: string): Promise<{path: string}> {
    const uploadBucketParams = {
      Bucket: '' + process.env.BUCKET,
      Key: `${keyPrefix}/${file.filename}`,
      Body: await readFile(file.path),
      ACL: ObjectCannedACL.public_read,
      ContentType: file.mimetype,
    };

    await this.s3Client.send(new PutObjectCommand(uploadBucketParams));
    return {
      path: `${process.env.FILEHOSTCDN}${uploadBucketParams.Key}`,
    };
  }

  async deleteFileFromS3(filePath: string): Promise<void> {
    var url = filePath.replace(process.env.FILEHOSTCDN ?? '', '');
    var bucketParam = {
      Bucket: process.env.BUCKET,
      Key: url,
    };
    await this.s3Client.send(new DeleteObjectCommand(bucketParam));
  }

  async checkIfFileExits(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: process.env.BUCKET,
          Key: key.replace(`${process.env.FILEHOSTCDN}`, ''),
        }),
      );
      return true;
    } catch (err) {
      return false;
    }
  }

  async updateFile(
    oldPath: string,
    file: any,
    folderPath: string,
  ): Promise<string> {
    if (await this.checkIfFileExits(oldPath)) {
      await this.deleteFileFromS3(oldPath);
    }
    return (await this.uploadFileToS3(file, folderPath)).path;
  }
}
