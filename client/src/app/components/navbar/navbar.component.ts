import { Component, HostListener, Input, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NavbarService } from './navbar.service';
import { RequestService } from 'src/app/services/request.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  constructor(
    private authService: AuthService,
    private navbarService: NavbarService,
    private requestService: RequestService,
    private router: Router
  ) {}

  @ViewChild('searchField') searchField: any;
  @Input() searchString: string = '';

  private wasInside: boolean = false;
  isProfileHidden: boolean = true;
  isMobileMenuOpen: boolean = false;

  isLoggedIn: boolean = this.authService.getIsLoggedIn();
  username: string = this.authService.getUsername();

  ngOnInit(): void {
    this.initNavbar();
  }

  search() {
    const searchTerm = this.searchField.nativeElement.value.trim();
    this.router.navigate(['/search'], { queryParams: { for: searchTerm } });
  }

  signOut(): void {
    const url = 'http://localhost:3000/auth/signout';

    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        if (res) {
          this.authService.setUsername('');
          this.authService.setIsLoggedIn(false);
          location.reload();
        } else {
          console.error(res);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  initNavbar() {
    const url = 'http://localhost:3000/username';

    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        if (res) {
          this.authService.setUsername(res.username);
          this.authService.setIsLoggedIn(true);
          this.username = this.authService.getUsername();
          this.isLoggedIn = this.authService.getIsLoggedIn();
        } else {
          this.authService.setUsername('');
          this.authService.setIsLoggedIn(false);
          this.username = this.authService.getUsername();
          this.isLoggedIn = this.authService.getIsLoggedIn();
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  onProfileClick(): void {
    this.isProfileHidden = !this.isProfileHidden;
    this.wasInside = true;
  }

  onProfileMenuClick(): void {
    this.wasInside = true;
  }

  onMobileMenuClick(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  @HostListener('document:click')
  onOutsideClick() {
    if (!this.wasInside) {
      this.isProfileHidden = true;
    }
    this.wasInside = false;
  }
}
