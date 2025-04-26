import { Controller, Get, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { GetUser } from 'src/decorators/getUser';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  getCalendarDetails(@GetUser() user: { userId: number }) {
    return this.calendarService.getCalendarDetails(user.userId);
  }
}
