import { Test, TestingModule } from '@nestjs/testing';
import { PomodoroController } from './pomodoro.controller';
import { PomodoroService } from './pomodoro.service';

describe('PomodoroController', () => {
  let controller: PomodoroController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PomodoroController],
      providers: [PomodoroService],
    }).compile();

    controller = module.get<PomodoroController>(PomodoroController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
