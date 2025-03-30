import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const MAX_FILE_SIZE = 500 * 1024; // 500KB

export const multerConfig = {
  storage: diskStorage({
    destination: function (req, res, cb) {
      const uploadDir = './uploads';
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req: any, file, cb) => {
    console.log('filetype', file.mimetype);
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new BadRequestException('Only .png, .jpg and .jpeg format allowed!'),
      );
    }
  },
};
