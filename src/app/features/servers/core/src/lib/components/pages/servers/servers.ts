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

  ngOnInit() {
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

  protected displayName(name: string): string {
    return name.replace(/^AMP_/, '').replace(/\d+$/, '');
  }
}


