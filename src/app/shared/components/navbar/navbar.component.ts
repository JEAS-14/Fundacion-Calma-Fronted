import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  isDarkMode = signal(false);

  toggleDarkMode() {
    const element = document.querySelector('html');
    if (element) {
      element.classList.toggle('app-dark');
      this.isDarkMode.set(element.classList.contains('app-dark'));
    }
  }
}
