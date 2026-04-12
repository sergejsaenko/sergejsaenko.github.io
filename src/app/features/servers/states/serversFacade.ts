import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameServer } from './serversModels';
import { GAME_SERVERS_QUERY } from './serversQueries';

export type { GameServer } from './serversModels';

@Injectable({ providedIn: 'root' })
export class GameServerService {
  constructor(private readonly apollo: Apollo) {}

  getServers(): Observable<GameServer[]> {
    return this.apollo
      .watchQuery<{ gameServers: GameServer[] }>({
        query: GAME_SERVERS_QUERY,
        pollInterval: 30000, // auto-refresh every 30 s
      })
      .valueChanges
      .pipe(map(result => (result.data?.gameServers ?? []) as unknown as GameServer[]));
  }
}


