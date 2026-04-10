import * as core from '@loopback/core';
import {CLEAN_UPLOADS_FOLDER_TASK} from './task-binding-key';
import path from 'path';
import {promises as fs} from 'fs';

@core.bind({
  scope: core.BindingScope.SINGLETON,
  tags: {key: CLEAN_UPLOADS_FOLDER_TASK.key},
})
export class CleanUploadsFolderTask {
  async execute() {
    const folderDir = path.join(process.cwd(), 'uploads');

    try {
      await fs.access(folderDir);

      const files = await fs.readdir(folderDir);
      const now = Date.now();
      const oneHourAgo = now - 1000 * 60 * 60; // 1 hour ago

      await Promise.all(
        files.map(async file => {
          const filePath = path.join(folderDir, file);

          try {
            const stats = await fs.stat(filePath);

            //* SAFETY: Only delete if the file is older than 1 hour | prevents deleting a file currently being uploaded
            if (stats.mtimeMs < oneHourAgo) {
              await fs.rm(filePath, {recursive: true, force: true});
            }
          } catch (e) {
            console.warn(`Could not delete ${file}, it might be in use.`);
          }
        }),
      );
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('Uploads folder not found, skipping.');
      } else {
        throw err;
      }
    }
  }
}
