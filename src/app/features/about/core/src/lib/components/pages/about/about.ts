import { Component } from '@angular/core';
import { TRANSLOCO_SCOPE, TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-about',
  imports: [TranslocoDirective],
  templateUrl: './about.html',
  styleUrl: './about.css',
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'about'
    }
  ]
})
export class About {

}
