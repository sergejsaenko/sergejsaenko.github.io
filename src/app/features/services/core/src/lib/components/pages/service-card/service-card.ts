import { Component, Input } from '@angular/core';
import { TranslocoDirective, TRANSLOCO_SCOPE } from '@jsverse/transloco';
import { ServiceStatus } from '../../../../../../states/servicesModels';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [TranslocoDirective],
  providers: [{ provide: TRANSLOCO_SCOPE, useValue: 'services' }],
  templateUrl: './service-card.html',
  styleUrl: './service-card.css',
})
export class ServiceCardComponent {
  @Input({ required: true }) service!: ServiceStatus;
}



