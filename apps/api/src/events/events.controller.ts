import { Controller, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.eventsService.getStream();
  }
}
