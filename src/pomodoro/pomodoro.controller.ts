import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PomodoroService } from './pomodoro.service';
import { CreatePomodoroDto } from './dto/create-pomodoro.dto';
import { UpdatePomodoroDto } from './dto/update-pomodoro.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/getUser';

@UseGuards(AuthGuard('jwt'))
@Controller('pomodoro')
export class PomodoroController {
  constructor(private readonly pomodoroService: PomodoroService) {}

  @Post()
  create(
    @Body() createPomodoroDto: CreatePomodoroDto,
    @GetUser() user: { userId: number },
  ) {
    return this.pomodoroService.create(createPomodoroDto, user.userId);
  }

  @Get()
  findAll(@GetUser() user: { userId: number }) {
    return this.pomodoroService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pomodoroService.findOne(+id);
  }

  @Patch()
  update(
    @Body() updatePomodoroDto: UpdatePomodoroDto,
    @GetUser() user: { userId: number },
  ) {
    return this.pomodoroService.update(updatePomodoroDto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pomodoroService.remove(+id);
  }
}
