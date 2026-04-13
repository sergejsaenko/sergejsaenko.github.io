import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServiceStatus } from './servicesModels';
import { SERVICES_STATUS_QUERY } from './servicesQueries';

export type { ServiceStatus } from './servicesModels';

@Injectable({ providedIn: 'root' })
export class ServicesStatusService {
  constructor(private readonly apollo: Apollo) {}

  getStatus(): Observable<ServiceStatus[]> {
    return this.apollo
      .watchQuery<{ servicesStatus: ServiceStatus[] }>({
        query: SERVICES_STATUS_QUERY,
        pollInterval: 30_000, // auto-refresh every 30 s
      })
      .valueChanges
      .pipe(map(result => (result.data?.servicesStatus ?? []) as unknown as ServiceStatus[]));
  }
}

