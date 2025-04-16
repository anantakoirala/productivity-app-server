import { Test, TestingModule } from '@nestjs/testing';
import { PomodoroService } from './pomodoro.service';

describe('PomodoroService', () => {
  let service: PomodoroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PomodoroService],
    }).compile();

    service = module.get<PomodoroService>(PomodoroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
