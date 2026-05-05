import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadedFileResponse } from '../interfaces/file-storage.interface';

@Injectable()
export class FileUploadService {
  private readonly uploadPath = 'uploads';

  async uploadFile(
    file: Express.Multer.File,
    folder = 'general',
  ): Promise<UploadedFileResponse> {
    try {
      // 1. Create unique filename to prevent overwriting
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const fullFolderPath = path.join(this.uploadPath, folder);

      // 2. Ensure directory exists
      await fs.ensureDir(fullFolderPath);

      // 3. Write file to disk
      const filePath = path.join(fullFolderPath, fileName);
      await fs.writeFile(filePath, file.buffer);
      const friendlyPath = filePath.replace(/\\/g, '/');
      return {
        filename: fileName,
        url: process.env.BASE_URL + friendlyPath,
        path: filePath,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error saving file to disk');
    }
  }
}
