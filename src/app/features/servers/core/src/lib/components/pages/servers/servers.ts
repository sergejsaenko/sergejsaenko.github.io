import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameServer, GameServerService } from '../../../../../../../../core/services/game-server.service';

@Component({
  selector: 'app-servers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servers.html',
  styleUrl: './servers.css',
})
export class Servers implements OnInit {
  protected readonly servers = signal<GameServer[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor(private readonly gameServerService: GameServerService) {}

  ngOnInit(): void {
    this.gameServerService.getServers().subscribe({
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

  // "MinecraftDaniel01" → "Minecraft Daniel 01"
  protected displayName(raw: string): string {
    return raw.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/(\D)(\d)/g, '$1 $2');
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
