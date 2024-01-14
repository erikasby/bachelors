import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { Router } from '@angular/router';
import { FormValidationService } from '../form-validation.service';
import { ResponseService } from '../../../components/response/response.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { RequestService } from 'src/app/services/request.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent {
  constructor(
    private formValidationService: FormValidationService,
    private httpClient: HttpClient,
    private router: Router,
    private responseService: ResponseService,
    private authService: AuthService,
    private requestService: RequestService
  ) {}

  isUsernameValid: boolean = true;
  isPasswordValid: boolean = true;
  isRequestValid: boolean = true;
  invalidUsernameResponse: string = '';
  invalidPasswordResponse: string = '';
  invalidRequestResponse: string = '';

  @ViewChild('request') request: any;
  @ViewChild('username') username: any;
  @ViewChild('password') password: any;

  // Refactor into LoggedInGuard
  ngOnInit(): void {
    const url = 'http://localhost:3000/username';

    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        if (res.isLoggedIn === true) {
          this.responseService.setResponse('Success', 'Already Logged In');
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    const isValid = this.validate();

    if (isValid) {
      const url = 'http://localhost:3000/auth/signin';
      const data = {
        username: this.username.nativeElement.value,
        password: this.password.nativeElement.value,
      };

      this.requestService.postRequest(url, data).subscribe({
        next: (res) => {
          if (res.status === 'Success') {
            this.responseService.setResponse(
              'Success',
              'Successfully Logged In'
            );
            this.authService.setIsLoggedIn(true);
            this.router.navigate(['/']);
          } else {
            this.invalidRequestResponse = 'Something went wrong';
            this.isRequestValid = false;
          }
        },
        error: (err) => {
          if (err.status === 401) {
            this.invalidRequestResponse = 'Username or password is incorrect';
            this.isRequestValid = false;
          } else {
            this.invalidRequestResponse = 'Something went wrong';
            this.isRequestValid = false;
            console.error(err.error.message);
          }
        },
      });
    }
  }

  validate(): boolean {
    let username = this.username.nativeElement.value;
    let password = this.password.nativeElement.value;

    let usernameValidity =
      this.formValidationService.validateUsername(username);
    let passwordValidity =
      this.formValidationService.validatePassword(password);

    if (usernameValidity.status === 'Success') this.isUsernameValid = true;
    else {
      this.invalidUsernameResponse = usernameValidity.status;
      this.isUsernameValid = false;

      return false;
    }

    if (passwordValidity.status === 'Success') this.isPasswordValid = true;
    else {
      this.invalidPasswordResponse = passwordValidity.status;
      this.isPasswordValid = false;

      return false;
    }

    return true;
  }

  reset(): void {
    this.isUsernameValid = true;
    this.isPasswordValid = true;
    this.isRequestValid = true;
  }
}
