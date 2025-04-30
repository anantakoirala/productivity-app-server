import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const WorkSpaceSchema = z
  .object({
    workspaceId: z.number(),
    icon: z.string().optional(),
    title: z.string().optional(),
    activeTagIds: z.array(z.number()),
    projectId: z.coerce.number().min(1, 'Project is required'),
    date: z.coerce.date().optional(), // 👈 FIXED
    content: z.any(),
  })
  .refine(
    (data) => {
      if (data.date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return data.date >= today;
      }
      return true;
    },
    {
      message: 'Start date cannot be before today',
      path: ['date'],
    },
  )
  .refine((data) => data.date, {
    message: 'Start date is required',
    path: ['date'],
  });
export class UpdateTaskDto extends createZodDto(WorkSpaceSchema) {}
