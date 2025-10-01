import { Component } from '@angular/core';

/**
 * Root component renders the Ocean Professional layout:
 * sidebar, topbar, and main content area via router-outlet.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'IntelliAnswer Q&A';
}
