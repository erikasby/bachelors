import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormValidationService } from '../form-validation.service';
import { ResponseService } from '../../../components/response/response.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestService } from 'src/app/services/request.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  constructor(
    private responseService: ResponseService,
    private formValidationService: FormValidationService,
    private httpClient: HttpClient,
    private router: Router,
    private requestService: RequestService
  ) {}

  isRequestValid: boolean = true;
  isEmailValid: boolean = true;
  isUsernameValid: boolean = true;
  isPasswordValid: boolean = true;
  isConfirmPasswordValid: boolean = true;

  invalidRequestResponse: string = '';
  invalidEmailResponse: string = '';
  invalidUsernameResponse: string = '';
  invalidPasswordResponse: string = '';
  invalidConfirmPasswordResponse: string = '';

  @ViewChild('request') request: any;
  @ViewChild('email') email: any;
  @ViewChild('username') username: any;
  @ViewChild('password') password: any;
  @ViewChild('confirmPassword') confirmPassword: any;

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
      const url = 'http://localhost:3000/auth/register';
      const data = {
        email: this.email.nativeElement.value,
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
            this.router.navigate(['/signin']);
          } else if (res.status === 'Username is already in use') {
            this.invalidRequestResponse = res.status;
            this.isRequestValid = false;
          } else if (res.status === 'Email is already in use') {
            this.invalidRequestResponse = res.status;
            this.isRequestValid = false;
          } else {
          }
        },
        error: (err) => {
          this.invalidRequestResponse = 'Something went wrong';
          this.isRequestValid = false;
          console.error(err.error.message);
        },
      });
    }
  }

  validate(): boolean {
    let email = this.email.nativeElement.value;
    let username = this.username.nativeElement.value;
    let password = this.password.nativeElement.value;
    let confirmPassword = this.confirmPassword.nativeElement.value;

    let emailValidity = this.formValidationService.validateEmail(email);
    let usernameValidity =
      this.formValidationService.validateUsername(username);
    let passwordValidity =
      this.formValidationService.validatePassword(password);

    if (emailValidity.status === 'Success') this.isEmailValid = true;
    else {
      this.invalidEmailResponse = emailValidity.status;
      this.isEmailValid = false;

      return false;
    }

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

    if (confirmPassword === password) this.isConfirmPasswordValid = true;
    else {
      this.invalidConfirmPasswordResponse = 'Passwords do not match';
      this.isConfirmPasswordValid = false;

      return false;
    }

    return true;
  }

  reset(): void {
    this.isRequestValid = true;
    this.isEmailValid = true;
    this.isUsernameValid = true;
    this.isPasswordValid = true;
    this.isConfirmPasswordValid = true;
  }
}
