import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * SidebarComponent
 * Provides navigation and quick actions.
 */
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(private router: Router) {}

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
