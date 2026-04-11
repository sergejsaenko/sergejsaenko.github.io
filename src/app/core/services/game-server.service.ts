import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';

const GAME_SERVERS = gql`
  query {
    gameServers {
      name
      status
      image
      uptime
      startedAt
    }
  }
`;

export interface GameServer {
  name: string;
  status: 'running' | 'exited' | 'paused' | string;
  image: string;
  uptime: string | null;
  startedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class GameServerService {
  constructor(private readonly apollo: Apollo) {}

  getServers() {
    return this.apollo
      .query<{ gameServers: GameServer[] }>({ query: GAME_SERVERS, fetchPolicy: 'network-only' })
      .pipe(map(result => result.data?.gameServers ?? []));
  }
}


