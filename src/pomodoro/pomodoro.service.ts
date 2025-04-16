import { Injectable } from '@nestjs/common';
import { CreatePomodoroDto } from './dto/create-pomodoro.dto';
import { UpdatePomodoroDto } from './dto/update-pomodoro.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PomodoroService {
  constructor(private prisma: PrismaService) {}
  async create(createPomodoroDto: CreatePomodoroDto, userId: number) {
    try {
      const pomodoroSetting = await this.prisma.pomodoroSetting.create({
        data: {
          userId: userId,
          workDuration: createPomodoroDto.workDuration,
          shortBreakDuration: createPomodoroDto.shortBreakDuration,
          longBreakDuration: createPomodoroDto.longBreakDuration,
          longBreakinterval: createPomodoroDto.longBreakInterval,
          rounds: createPomodoroDto.rounds,
        },
      });

      return { success: true, pomodoroSetting: pomodoroSetting };
    } catch (error) {
      throw error;
    }
  }

  async findAll(userId: number) {
    try {
      const pomodoroSetting = await this.prisma.pomodoroSetting.findFirst({
        where: { userId: userId },
      });

      return { success: true, pomodoroSetting };
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} pomodoro`;
  }

  async update(updatePomodoroDto: UpdatePomodoroDto, userId: number) {
    try {
      const pomodoroSetting = await this.prisma.pomodoroSetting.findFirst({
        where: { userId: userId },
      });

      let result;

      if (pomodoroSetting) {
        result = await this.prisma.pomodoroSetting.update({
          where: { id: pomodoroSetting.id },
          data: {
            workDuration: updatePomodoroDto.workDuration,
            shortBreakDuration: updatePomodoroDto.shortBreakDuration,
            longBreakDuration: updatePomodoroDto.longBreakDuration,
            longBreakinterval: updatePomodoroDto.longBreakInterval,
            rounds: updatePomodoroDto.rounds,
            soundEffect: updatePomodoroDto.soundEffect,
            soundEffectVolume: updatePomodoroDto.soundEffectVolume,
          },
        });
      } else {
        result = await this.prisma.pomodoroSetting.create({
          data: {
            workDuration: updatePomodoroDto.workDuration,
            shortBreakDuration: updatePomodoroDto.shortBreakDuration,
            longBreakDuration: updatePomodoroDto.longBreakDuration,
            longBreakinterval: updatePomodoroDto.longBreakInterval,
            rounds: updatePomodoroDto.rounds,
            userId: userId,
            soundEffect: updatePomodoroDto.soundEffect,
            soundEffectVolume: updatePomodoroDto.soundEffectVolume,
          },
        });
      }

      return {
        success: true,
        pomodoroSetting: result,
      };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} pomodoro`;
  }
}
