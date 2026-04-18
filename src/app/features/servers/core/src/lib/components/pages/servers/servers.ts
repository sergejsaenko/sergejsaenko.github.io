import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameServer, GameServerService } from '../../../../../../states/serversFacade';

@Component({
  selector: 'app-servers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servers.html',
  styleUrl: './servers.css',
})
export class Servers implements OnInit {
  protected readonly servers = signal<GameServer[]>([]);
  protected readonly search = signal('');
  // derived list: filter by search term and sort running servers first
  protected readonly filteredServers = computed(() => {
    const term = this.search().trim().toLowerCase();
    const list = this.servers();
    const filtered = term
      ? list.filter(s => (s.friendlyName ?? '').toLowerCase().includes(term))
      : list.slice();
    // sort: running status first
    filtered.sort((a, b) => {
      const aRunning = (a.status ?? '').toLowerCase() === 'running' ? 0 : 1;
      const bRunning = (b.status ?? '').toLowerCase() === 'running' ? 0 : 1;
      if (aRunning !== bRunning) return aRunning - bRunning;

      // if both running, prefer 'Running' ampStatus over 'Idle'
      const aAmpRunning = (a.ampStatus ?? '').toLowerCase() === 'running' ? 0 : 1;
      const bAmpRunning = (b.ampStatus ?? '').toLowerCase() === 'running' ? 0 : 1;
      return aAmpRunning - bAmpRunning;
    });
    return filtered;
  });
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor(private readonly gameServerService: GameServerService) {}

  ngOnInit(): void {    this.gameServerService.getServers().subscribe({
      next: (data) => {
        this.servers.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Server konnten nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }


  // "subdomain.domain.de:25565" → { host: "subdomain.domain.de", port: "25565" }
  // null/empty → { host: "-", port: "-" }
  protected parseBrandUrl(url: string | null | undefined): { host: string; port: string } {
    if (!url) return { host: '-', port: '-' };
    const lastColon = url.lastIndexOf(':');
    if (lastColon === -1) return { host: url, port: '-' };
    return {
      host: url.substring(0, lastColon),
      port: url.substring(lastColon + 1),
    };
  }
}
