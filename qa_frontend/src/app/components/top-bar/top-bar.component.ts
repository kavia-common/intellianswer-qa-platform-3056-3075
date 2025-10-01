import { Component } from '@angular/core';

/**
 * TopBarComponent
 * Displays application title, search placeholder, and user/settings actions.
 */
@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent {
  userInitials = 'JD';
  showMenu = false;

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
}
