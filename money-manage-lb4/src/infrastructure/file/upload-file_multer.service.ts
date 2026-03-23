import {BindingScope, injectable} from '@loopback/core';
import multer from 'multer';
import {v4 as uuidv4} from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import {UPLOAD_FILE_MULTER_SERVICE} from '../binding_key.infrastructure';

export type UploadedFileInfo = {
  fieldName: string;
  originalname: string;
  mimetype: string;
  filename: string;
  path: string;
  size: number;
  url: string;
};

@injectable({
  scope: BindingScope.SINGLETON,
  tags: {key: UPLOAD_FILE_MULTER_SERVICE.key},
})
export class UploadFileMulterService {
  private parentPath = path.resolve(__dirname, '../../..');

  private ensureFolder(targetFolder: string) {
    const dir = path.join(this.parentPath, 'uploads', targetFolder);
    fs.mkdirSync(dir, {recursive: true});
  }

  private buildMulter(targetFolder: string) {
    const storage = multer.diskStorage({
      destination: (req, file, cb) =>
        cb(null, path.join(this.parentPath, 'uploads', targetFolder)),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext);
        cb(null, `${base}-${uuidv4()}${ext}`);
      },
    });
    return multer({storage});
  }

  /**
   * API gọn cho mọi nơi: chỉ cần gọi upload('wallpapers', req, res)
   */
  async upload(
    targetFolder: string,
    req: ExpressRequest,
    res: ExpressResponse,
  ): Promise<UploadedFileInfo[]> {
    //Tạo folder
    this.ensureFolder(targetFolder);

    //Cấu hình multer
    const m = this.buildMulter(targetFolder);

    //Parse stream sang req.files và req.body.
    return new Promise<UploadedFileInfo[]>((resolve, reject) => {
      m.any()(req as any, res as any, (err: any) => {
        if (err) return reject(err);

        const files = (req as any).files as Express.Multer.File[] | undefined;
        if (!files?.length) return resolve([]);

        const results = files.map(f => ({
          fieldName: f.fieldname,
          originalname: f.originalname,
          mimetype: f.mimetype,
          filename: f.filename,
          path: f.path,
          size: f.size,
          url: `http://[::1]:3000/uploads/${targetFolder}/${f.filename}`,
        }));
        resolve(results);
      });
    });
  }
}
