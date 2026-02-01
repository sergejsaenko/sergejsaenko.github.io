import { Component } from '@angular/core';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-about',
  imports: [TranslocoDirective, TranslocoPipe],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {

}
