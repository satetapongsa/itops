import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ServerEvent {
  type: string;
  data: any;
}

@Injectable()
export class EventsService {
  private eventSubject = new Subject<ServerEvent>();

  broadcast(type: string, data: any) {
    this.eventSubject.next({ type, data });
  }

  getStream(): Observable<MessageEvent> {
    return this.eventSubject.asObservable().pipe(
      map((event) => {
        return {
          data: JSON.stringify(event),
        } as MessageEvent;
      }),
    );
  }
}
