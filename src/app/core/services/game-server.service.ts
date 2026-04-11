import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface GameServer {
  name: string;
  status: 'running' | 'stopped';
  ampStatus: string;          // never null: 'Stopped' | 'Idle' | 'Running' | …
  image: string;              // AMP module: 'Minecraft' | 'GenericModule' | …
  brandUrl: string | null;    // format: "subdomain.domain.de:port"
  uptime: string | null;
  startedAt: string | null;
  players: number | null;
  maxPlayers: number | null;
}

const GAME_SERVERS_QUERY = gql`
  query {
    gameServers {
      name
      status
      ampStatus
      image
      brandUrl
      uptime
      startedAt
      players
      maxPlayers
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class GameServerService {
  constructor(private readonly apollo: Apollo) {}

  getServers(): Observable<GameServer[]> {
    return this.apollo
      .watchQuery<{ gameServers: GameServer[] }>({
        query: GAME_SERVERS_QUERY,
        pollInterval: 30000,  // auto-refresh every 30 s
      })
      .valueChanges
      .pipe(map(result => (result.data?.gameServers ?? []) as unknown as GameServer[]));
  }
}

