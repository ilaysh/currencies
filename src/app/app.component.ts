import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AbsNumPipe } from './abs-num.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  title = 'currencyConverter';
}
