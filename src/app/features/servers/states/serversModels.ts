export interface GameServer {
  friendlyName: string;
  status: 'running' | 'stopped';
  ampStatus: string; // 'Stopped' | 'Idle' | 'Running' | 'Starting' | 'Stopping' | 'Installing' | 'Updating' | 'Failed'
  image: string;     // AMP module name: 'Minecraft' | 'GenericModule' | …
  brandUrl: string | null; // format: "subdomain.domain.de:port"
  uptime: string | null;
  startedAt: string | null;
  players: number | null;
  maxPlayers: number | null;
}

