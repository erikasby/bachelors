import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  private isLoggedIn: boolean = false;
  private username: string = '';
  private userId: number = NaN;

  setIsLoggedIn(value: boolean) {
    this.isLoggedIn = value;
  }

  getIsLoggedIn(): boolean {
    return this.isLoggedIn;
  }

  setUsername(value: string) {
    this.username = value;
  }

  getUsername(): string {
    return this.username;
  }

  setUserId(value: number) {
    this.userId = value;
  }

  getUserId(): number {
    return this.userId;
  }
}
