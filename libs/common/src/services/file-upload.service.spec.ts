import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadService } from './file-upload.service';
import { InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

jest.mock('fs-extra');
jest.mock('uuid');

describe('FileUploadService', () => {
  let service: FileUploadService;

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
    size: 1024,
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  };

  const mockUuid = '12345678-1234-1234-1234-123456789abc';

  beforeEach(async () => {
    jest.clearAllMocks();
    (uuidv4 as jest.Mock).mockReturnValue(mockUuid);

    const module: TestingModule = await Test.createTestingModule({
      providers: [FileUploadService],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
  });

  describe('uploadFile', () => {
    it('should upload file successfully with default folder', async () => {
      const expectedFileName = `${mockUuid}.jpg`;
      const expectedFolderPath = path.join('uploads', 'general');
      const expectedFilePath = path.join(expectedFolderPath, expectedFileName);

      (fs.ensureDir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await service.uploadFile(mockFile);

      expect(result.filename).toBe(expectedFileName);
      expect(result.mimetype).toBe('image/jpeg');
      expect(result.size).toBe(1024);
      expect(result.path).toBe(expectedFilePath); // path.normalize استعمال کرے گا
      expect(result.url).toContain(expectedFileName);

      expect(fs.ensureDir).toHaveBeenCalledWith(expectedFolderPath);
      expect(fs.writeFile).toHaveBeenCalledWith(
        expectedFilePath,
        mockFile.buffer,
      );
    });

    it('should upload file to custom folder', async () => {
      const folder = 'documents';
      const expectedFileName = `${mockUuid}.jpg`;
      const expectedFilePath = path.join('uploads', folder, expectedFileName);

      (fs.ensureDir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await service.uploadFile(mockFile, folder);

      expect(result.path).toBe(expectedFilePath);
      expect(fs.ensureDir).toHaveBeenCalledWith(path.join('uploads', folder));
    });

    it('should throw InternalServerErrorException when file saving fails', async () => {
      (fs.ensureDir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockRejectedValue(
        new Error('Disk write error'),
      );

      await expect(service.uploadFile(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.uploadFile(mockFile)).rejects.toThrow(
        'Error saving file to disk',
      );
    });

    it('should handle empty buffer gracefully', async () => {
      const emptyFile = { ...mockFile, buffer: Buffer.from(''), size: 0 };

      (fs.ensureDir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await service.uploadFile(emptyFile);

      expect(result.size).toBe(0);
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        Buffer.from(''),
      );
    });
  });
});
