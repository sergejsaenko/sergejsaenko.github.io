import { Component } from '@angular/core';
import { About } from '../components/about/about';

@Component({
  selector: 'app-home',
  imports: [About],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
