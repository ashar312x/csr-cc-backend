import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const pdfFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(pdf|jpg|jpeg|png)$/i)) {
    return callback(
      new BadRequestException('Only PDF, JPG, and PNG files are allowed!'),
      false,
    );
  }
  callback(null, true);
};
