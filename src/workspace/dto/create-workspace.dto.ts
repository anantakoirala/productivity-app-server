import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const MAX_FILE_SIZE = 500 * 1024; // 500KB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const WorkSpaceSchema = z.object({
  workspacename: z.string().min(2),
  workspaceImage: z
    .any()
    .optional()
    .refine(
      (file) => {
        if (file) {
          // Only validate if file is present
          return file instanceof File;
        }
        return true; // skip validation if no file
      },
      {
        message: 'Please select an image file',
      },
    )
    .refine(
      (file) => {
        if (file) {
          return file.size <= MAX_FILE_SIZE;
        }
        return true;
      },
      {
        message: 'Image must be less than 500KB',
      },
    )
    .refine(
      (file) => {
        if (file) {
          return ACCEPTED_IMAGE_TYPES.includes(file.type);
        }
        return true;
      },
      {
        message: 'Only .jpg, .jpeg, .png files are accepted',
      },
    ),
});

export class CreateWorkSpaceDto extends createZodDto(WorkSpaceSchema) {}
