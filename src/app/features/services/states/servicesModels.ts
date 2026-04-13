export interface ServiceStatus {
  name: string;
  displayName: string;
  url: string;
  status: 'online' | 'offline';
  responseMs: number | null; // null when offline / timeout
}

