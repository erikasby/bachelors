import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from 'src/app/services/request.service';
import { ResponseService } from '../response/response.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  constructor(
    private requestService: RequestService,
    private router: Router,
    private responseService: ResponseService,
    private authService: AuthService
  ) {}

  private username: string = '';

  getUsername(): string {
    return this.username;
  }

  setUsername(username: string): void {
    this.username = username;
  }
}
