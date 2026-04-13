import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TRANSLOCO_SCOPE, TranslocoDirective } from '@jsverse/transloco';
import { ServicesStatusService, ServiceStatus } from '../../../../../../states/servicesFacade';
import { ServiceCardComponent } from '../service-card/service-card';
import { AuthService } from '../../../../../../../auth/states/authFacade';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [TranslocoDirective, ServiceCardComponent],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: 'services' }],
  templateUrl: './services-page.html',
  styleUrl: './services-page.css',
})
export class ServicesPage implements OnInit {
  protected readonly services = signal<ServiceStatus[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor(
    private readonly statusService: ServicesStatusService,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    this.statusService.getStatus().subscribe({
      next: (data) => {
        this.services.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('error');
        this.loading.set(false);
      },
    });
  }
}




