import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

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
  fileFilter: (req: any, file, cb) => {
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
