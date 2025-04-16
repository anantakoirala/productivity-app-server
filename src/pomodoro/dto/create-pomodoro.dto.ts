import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const Schema = z.object({
  workDuration: z.number().min(5).max(60),
  shortBreakDuration: z.number().min(1).max(15),
  longBreakDuration: z.number().min(10).max(45),
  longBreakInterval: z.number().min(2).max(10),
  rounds: z.number().min(1).max(10),
  sound: z.enum(['ANALOG', 'BELL', 'BIRD', 'CHURCH_BELL', 'DIGITAL', 'FANCY']),
  soundEffectVolume: z.number().min(0).max(1),
});

export class CreatePomodoroDto extends createZodDto(Schema) {}
